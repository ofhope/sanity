// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import {UserAvatar} from '@sanity/base/components'
import {AvatarStack} from 'part:@sanity/components/avatar'
import React from 'react'

interface UserAvatarStackProps {
  maxLength?: number
  userIds: string[]
}

export function UserAvatarStack({maxLength, userIds}: UserAvatarStackProps) {
  return (
    <AvatarStack maxLength={maxLength}>
      {userIds.map((userId) => (
        <UserAvatar key={userId} userId={userId} />
      ))}
    </AvatarStack>
  )
}
