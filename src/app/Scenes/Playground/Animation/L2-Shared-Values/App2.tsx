import { Button } from "@artsy/palette-mobile"
import { View } from "react-native"
import Animated, { useSharedValue } from "react-native-reanimated"

export const SharedValuesLevel2: React.FC<{}> = () => {
  const width = useSharedValue(100)

  const handlePress = () => {
    width.set((value) => value + 50)
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Animated.View
        style={{
          width: width.get(),
          height: 100,
          backgroundColor: "violet",
        }}
      />
      <Button block onPress={handlePress} mt={2}>
        Click me
      </Button>
    </View>
  )
}
