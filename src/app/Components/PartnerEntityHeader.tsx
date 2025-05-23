import { Box, BoxProps, EntityHeader } from "@artsy/palette-mobile"
import { PartnerEntityHeader_partner$data } from "__generated__/PartnerEntityHeader_partner.graphql"
import { PartnerFollowButtonFragmentContainer as PartnerFollowButton } from "app/Scenes/Partner/Components/PartnerFollowButton"
import { RouterLink } from "app/system/navigation/RouterLink"
import { limitWithCount } from "app/utils/limitWithCount"
import { compact } from "lodash"
import { createFragmentContainer, graphql } from "react-relay"

export interface PartnerEntityHeaderProps extends BoxProps {
  partner: PartnerEntityHeader_partner$data
}

export const PartnerEntityHeader: React.FC<PartnerEntityHeaderProps> = ({ partner, ...rest }) => {
  if (!partner.name || !partner.profile) {
    return null
  }

  const cities = limitWithCount(compact(partner.cities), 2).join(", ")
  const avatarUrl = partner.profile.icon?.url

  return (
    <Box {...rest}>
      <RouterLink noFeedback to={partner.href}>
        <EntityHeader
          name={partner.name}
          meta={cities ?? undefined}
          imageUrl={avatarUrl ?? undefined}
          initials={partner.initials ?? undefined}
          FollowButton={<PartnerFollowButton partner={partner} />}
        />
      </RouterLink>
    </Box>
  )
}

export const PartnerEntityHeaderFragmentContainer = createFragmentContainer(PartnerEntityHeader, {
  partner: graphql`
    fragment PartnerEntityHeader_partner on Partner {
      ...PartnerFollowButton_deprecated_partner
      href
      name
      cities
      isDefaultProfilePublic
      initials
      profile {
        icon {
          url(version: "square140")
        }
      }
    }
  `,
})
