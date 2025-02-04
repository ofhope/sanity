// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {LegacyLayerProvider, UserAvatar} from '@sanity/base/components'
import {useGlobalPresence} from '@sanity/base/hooks'
import {Card} from '@sanity/ui'
import CogIcon from 'part:@sanity/base/cog-icon'
import UsersIcon from 'part:@sanity/base/users-icon'
import {AvatarStack} from 'part:@sanity/components/avatar'
import Button from 'part:@sanity/components/buttons/default'
import {ClickOutside} from 'part:@sanity/components/click-outside'
import {Popover} from 'part:@sanity/components/popover'
import Escapable from 'part:@sanity/components/utilities/escapable'
import React, {useCallback, useState} from 'react'
import {versionedClient} from '../../versionedClient'
import {PresenceListRow} from './PresenceListRow'

import styles from './PresenceMenu.css'

const MAX_AVATARS_GLOBAL = 4

export function PresenceMenu() {
  const {projectId} = versionedClient.config()
  const presence = useGlobalPresence()
  const [open, setOpen] = useState(false)

  const handleToggle = useCallback(() => setOpen(!open), [open])
  const handleClose = useCallback(() => setOpen(false), [])

  const popoverContent = (
    <Card className={styles.popoverContent} scheme="light">
      {presence.length === 0 && (
        <div className={styles.header}>
          <h2 className={styles.title}>No one else is here</h2>
          <p className={styles.subtitle}>
            Invite people to the project to see their online status.
          </p>
        </div>
      )}

      {presence.length > 0 && (
        <div className={styles.avatarList}>
          {presence.map((item) => (
            <PresenceListRow key={item.user.id} presence={item} onClose={handleClose} />
          ))}
        </div>
      )}

      <div className={styles.manageMembers}>
        <a
          href={`https://manage.sanity.io/projects/${projectId}/team`}
          className={styles.manageLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClose}
        >
          <span>Manage members</span>
          <CogIcon />
        </a>
      </div>
    </Card>
  )

  return (
    <ClickOutside onClickOutside={handleClose}>
      {(ref) => (
        <div className={styles.root} ref={ref as React.Ref<HTMLDivElement>}>
          <LegacyLayerProvider zOffset="navbarPopover">
            <Popover content={popoverContent as any} open={open}>
              <div>
                <Button
                  className={styles.narrowButton}
                  icon={UsersIcon}
                  iconStatus={presence.length > 0 ? 'success' : undefined}
                  kind="simple"
                  onClick={handleToggle}
                  padding="small"
                  selected={open}
                  tone="navbar"
                />

                <Button
                  className={styles.wideButton}
                  kind="simple"
                  onClick={handleToggle}
                  padding="small"
                  selected={open}
                  tone="navbar"
                >
                  <AvatarStack
                    className={styles.avatarStack}
                    maxLength={MAX_AVATARS_GLOBAL}
                    tone="navbar"
                  >
                    {presence.map((item) => (
                      <UserAvatar key={item.user.id} user={item.user} />
                    ))}
                  </AvatarStack>
                </Button>
              </div>
            </Popover>
          </LegacyLayerProvider>

          {open && <Escapable onEscape={handleClose} />}
        </div>
      )}
    </ClickOutside>
  )
}
