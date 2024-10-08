import { Box, Flex, useTheme } from "@artsy/palette-mobile"
import { AuthContext } from "app/Scenes/Onboarding/Auth2/AuthContext"
import { MotiView } from "moti"
import { Dimensions, KeyboardAvoidingView, Platform } from "react-native"
import { Easing } from "react-native-reanimated"

const HEIGHT = {
  LoginWelcomeStep: 320,
  LoginEmailStep: 320,
  LoginPasswordStep: 320,
  ForgotPasswordStep: 320,
  LoginOTPStep: 280,
  OnboardingWebView: 300,
  SignUpPasswordStep: 300,
  SignUpNameStep: 500,
  collapsed: 300,
}

export const AuthModal: React.FC = ({ children }) => {
  const { isModalExpanded, isMounted, currentScreen } = AuthContext.useStoreState((state) => state)

  const { space } = useTheme()

  const screenHeight = Dimensions.get("window").height

  const height = (() => {
    if (isModalExpanded) {
      return HEIGHT[currentScreen?.name ?? "LoginWelcomeStep"]
    }

    return HEIGHT.collapsed
  })()

  const translateY = (() => {
    // Position the modal in the center of the screen, minus some padding
    if (isModalExpanded) {
      return 0
    }

    return screenHeight / 2 - height / 2 - space(6)
  })()

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Box flex={1} height="100%" justifyContent="center">
        <MotiView
          from={{
            translateY: isModalExpanded ? 0 : screenHeight,
          }}
          animate={{
            translateY,
          }}
          transition={{
            type: "timing",
            duration: isModalExpanded ? 800 : 600,
            delay: isMounted ? 0 : 500,
            easing: Easing.out(Easing.exp),
          }}
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: space(2),
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Flex justifyContent="center" p={1}>
            {children}
          </Flex>
        </MotiView>
      </Box>
    </KeyboardAvoidingView>
  )
}
