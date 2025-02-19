import { ChevronIcon, Flex, Separator, Spacer, Text, useColor } from "@artsy/palette-mobile"
import { ArtsyNativeModule } from "app/NativeModules/ArtsyNativeModule"
import { GlobalStore } from "app/store/GlobalStore"
import { EnvironmentKey, environment } from "app/store/config/EnvironmentModel"
import { DevMenuButtonItem } from "app/system/devTools/DevMenu/Components/DevMenuButtonItem"
import { _globalCacheRef } from "app/system/relay/defaultEnvironment"
import { capitalize, compact } from "lodash"
import { useState } from "react"
import { Alert, AlertButton, TouchableHighlight } from "react-native"

export const EnvironmentOptions: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const color = useColor()
  const { env, localOverrides, strings } = GlobalStore.useAppState(
    (store) => store.devicePrefs.environment
  )
  // show custom url options if there are already local overrides in effect, or if the user has tapped the option
  // to set custom overrides during the lifetime of this component
  const [showCustomURLOptions, setShowCustomURLOptions] = useState(false)
  Object.keys(localOverrides).length > 0

  return (
    <>
      <Flex mx={2}>
        <Separator borderColor="black100" />
      </Flex>
      <Spacer y={0.5} />

      <DevMenuButtonItem
        title="Environment"
        value={showCustomURLOptions ? `Custom (${capitalize(env)})` : capitalize(env)}
        direction="down"
        onPress={() => {
          Alert.alert(
            "Environment",
            undefined,
            compact([
              envMenuOption("staging", env, showCustomURLOptions, setShowCustomURLOptions, onClose),
              envMenuOption(
                "production",
                env,
                showCustomURLOptions,
                setShowCustomURLOptions,
                onClose
              ),
              {
                text: "Cancel",
                style: "destructive",
              },
            ]),
            { cancelable: true }
          )
        }}
      />
      {!!showCustomURLOptions &&
        Object.entries(environment).map(([key, { description, presets }]) => {
          return (
            <TouchableHighlight
              key={key}
              underlayColor={color("black5")}
              onPress={() => {
                Alert.alert(
                  description,
                  undefined,
                  Object.entries(presets).map(([name, value]) => ({
                    text: name,
                    onPress: () => {
                      GlobalStore.actions.devicePrefs.environment.setLocalOverride({
                        key: key as EnvironmentKey,
                        value,
                      })
                    },
                  }))
                )
              }}
            >
              <Flex
                ml={2}
                mr="15px"
                my="5px"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Flex>
                  <Text variant="xs" color="black60" mb="0.5">
                    {description}
                  </Text>
                  <Flex key={key} flexDirection="row" justifyContent="space-between">
                    <Text variant="sm-display">{strings[key as EnvironmentKey]}</Text>
                  </Flex>
                </Flex>
                <ChevronIcon fill="black60" direction="right" />
              </Flex>
            </TouchableHighlight>
          )
        })}
    </>
  )
}

function envMenuOption(
  env: "staging" | "production",
  currentEnv: "staging" | "production",
  showCustomURLOptions: boolean,
  setShowCustomURLOptions: (newValue: boolean) => void,
  onClose: () => void
): AlertButton | null {
  let text = `Log out and switch to '${capitalize(env)}'`
  if (currentEnv === env) {
    if (!ArtsyNativeModule.isBetaOrDev) {
      return null
    }
    if (showCustomURLOptions) {
      text = `Reset all to '${capitalize(env)}'`
    } else {
      text = `Customize '${capitalize(env)}'`
    }
  }
  return {
    text,
    onPress() {
      GlobalStore.actions.devicePrefs.environment.clearLocalOverrides()
      if (env !== currentEnv) {
        GlobalStore.actions.devicePrefs.environment.setEnv(env)
        onClose()
        GlobalStore.actions.auth.signOut()
        _globalCacheRef?.clear()
      } else {
        setShowCustomURLOptions(!showCustomURLOptions)
      }
    },
  }
}
