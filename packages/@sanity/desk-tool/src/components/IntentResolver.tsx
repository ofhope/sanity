import {uuid} from '@sanity/uuid'
import {getTemplateById} from '@sanity/base/initial-value-templates'
import React, {useEffect, useState} from 'react'
import {of} from 'rxjs'
import {map} from 'rxjs/operators'
import {getPublishedId} from 'part:@sanity/base/util/draft-utils'
import {useRouter} from '@sanity/base/router'
import Spinner from 'part:@sanity/components/loading/spinner'
import {versionedClient} from '../versionedClient'
import {useStructure} from '../utils/resolvePanes'
import {LOADING_PANE} from '../constants'
import {StructureError} from './StructureError'

export interface IntentResolverProps {
  params: {type: string; id: string; [key: string]: unknown}
  payload: unknown
}

const FALLBACK_ID = '__fallback__'

function removeDraftPrefix(documentId: string) {
  const publishedId = getPublishedId(documentId)
  if (publishedId !== documentId) {
    // eslint-disable-next-line no-console
    console.warn(
      'Removed unexpected draft id in document link: All links to documents should have the `draft.`-prefix removed and something appears to have made an intent link to `%s`',
      documentId
    )
  }
  return publishedId
}

/**
 *
 * This is a *very naive* implementation of an intent resolver:
 * - If type is missing from params, it'll try to resolve from document
 * - It manually builds a pane segment path: "<typeName>;<documentId>"
 * - Tries to resolve that to a structure
 * - Checks if the last pane segment is an editor, and if so; is it the right type/id?
 *   - Yes: Resolves to "<typeName>;<documentId>"
 *   - No : Resolves to fallback edit pane (context-less)
 */
// eslint-disable-next-line complexity
export const IntentResolver = React.memo(function IntentResolver({
  params,
  payload,
}: IntentResolverProps) {
  const {type: specifiedSchemaType, id, ...otherParams} = params || {}

  const documentId = id || FALLBACK_ID
  const {documentType, isLoaded} = useDocumentType(documentId, specifiedSchemaType)
  const paneSegments = documentType
    ? [[{id: documentType, params: otherParams}], [{id: documentId, params: otherParams, payload}]]
    : undefined

  const {structure, error} = useStructure(paneSegments, {silent: true})

  if (error) {
    return <StructureError error={error} />
  }

  if (!documentType) {
    return isLoaded ? (
      <Redirect panes={[[{id: `__edit__${id || uuid()}`, params: otherParams}]]} />
    ) : (
      <Spinner center message="Resolving document type…" delay={600} />
    )
  }

  const isLoading = !structure || structure.some((item) => item === LOADING_PANE)
  if (isLoading) {
    return <Spinner center message="Resolving structure…" delay={600} />
  }

  const panes = getNewRouterState({
    structure,
    documentType,
    params: otherParams,
    payload,
    paneSegments,
    documentId,
  })

  return <Redirect panes={panes} />
})

function getNewRouterState({structure, documentType, params, payload, documentId, paneSegments}) {
  const lastChild = structure[structure.length - 1] || {}
  const lastGroup = paneSegments[paneSegments.length - 1]
  const lastSibling = lastGroup[lastGroup.length - 1]
  const terminatesInDocument = lastChild.type === 'document' && lastChild.options.id === documentId

  const {template: isTemplateCreate, ...otherParams} = params
  const template = isTemplateCreate && getTemplateById(params.template)
  const type = (template && template.schemaType) || documentType
  const fallbackParameters = {...otherParams, type, template: params.template}
  const newDocumentId = documentId === FALLBACK_ID ? uuid() : removeDraftPrefix(documentId)

  return terminatesInDocument
    ? paneSegments
        .slice(0, -1)
        .concat([lastGroup.slice(0, -1).concat({...lastSibling, id: newDocumentId})])
    : [[{id: `__edit__${newDocumentId}`, params: fallbackParameters, payload}]]
}

// Navigates to passed router panes state on mount
function Redirect({panes}) {
  const router = useRouter()

  useEffect(() => {
    router.navigate({panes}, {replace: true})
  })

  return <Spinner center message="Redirecting…" delay={600} />
}

function useDocumentType(documentId: string, specifiedType: string) {
  const [{documentType, isLoaded}, setDocumentType] = useState<{
    documentType?: string
    isLoaded: boolean
  }>({isLoaded: false})
  useEffect(() => {
    const sub = resolveTypeForDocument(documentId, specifiedType).subscribe((typeName) =>
      setDocumentType({documentType: typeName, isLoaded: true})
    )
    return () => sub.unsubscribe()
  })
  return {documentType, isLoaded}
}

function resolveTypeForDocument(id: string, specifiedType: string) {
  if (specifiedType) {
    return of(specifiedType)
  }

  const query = '*[_id in [$documentId, $draftId]]._type'
  const documentId = id.replace(/^drafts\./, '')
  const draftId = `drafts.${documentId}`
  return versionedClient.observable
    .fetch(query, {documentId, draftId})
    .pipe(map((types) => types[0]))
}
