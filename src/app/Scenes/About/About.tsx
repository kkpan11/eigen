import { useTheme } from "@artsy/palette-mobile"
import { MenuItem } from "app/Components/MenuItem"
import { useToast } from "app/Components/Toast/toastHook"
import { GlobalStore } from "app/store/GlobalStore"
import React, { useEffect, useState } from "react"
import { ScrollView } from "react-native"
import DeviceInfo from "react-native-device-info"
import useDebounce from "react-use/lib/useDebounce"

export const About: React.FC = () => {
  const { color } = useTheme()
  const appVersion = DeviceInfo.getVersion()
  const toast = useToast()
  const [tapCount, updateTapCount] = useState(0)
  const { value: userIsDev, flipValue: userIsDevFlipValue } = GlobalStore.useAppState(
    (store) => store.artsyPrefs.userIsDev
  )

  useEffect(() => {
    const flip = (userIsDev && tapCount >= 3) || (!userIsDev && tapCount >= 7)
    if (flip) {
      updateTapCount((_) => 0)
      GlobalStore.actions.artsyPrefs.userIsDev.setFlipValue(!userIsDevFlipValue)
      const nextValue = !userIsDev
      if (nextValue) {
        toast.show('Developer mode enabled.\nTap "Version" three times to disable it.', "bottom")
      } else {
        toast.show("Developer mode disabled.", "bottom")
      }
    }
  }, [tapCount])

  useDebounce(
    () => {
      if (tapCount !== 0) {
        updateTapCount((_) => 0)
      }
    },
    350,
    [tapCount]
  )

  return (
    <ScrollView contentContainerStyle={{ paddingTop: 10 }}>
      <MenuItem href="/terms" title="Terms and Conditions" />
      <MenuItem href="/privacy" title="Privacy Policy" />
      <MenuItem href="/supplemental-cos" title="Auction Supplement" />
      <MenuItem
        title="Version"
        text={appVersion}
        onPress={() => updateTapCount((count) => count + 1)}
        chevron={false}
        style={
          userIsDev ? { borderRightColor: color("devpurple"), borderRightWidth: 1 } : undefined
        }
      />
    </ScrollView>
  )
}
