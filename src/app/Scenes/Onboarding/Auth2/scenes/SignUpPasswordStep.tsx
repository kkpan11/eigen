import { BackButton, Button, Flex, Input, LinkText, Spacer, Text } from "@artsy/palette-mobile"
import { PasswordInput } from "app/Scenes/Onboarding/Auth2/components/PasswordInput"
import {
  useAuthNavigation,
  useAuthScreen,
} from "app/Scenes/Onboarding/Auth2/hooks/useAuthNavigation"
import { useInputAutofocus } from "app/Scenes/Onboarding/Auth2/hooks/useInputAutofocus"
import { waitForSubmit } from "app/Scenes/Onboarding/Auth2/utils/waitForSubmit"
import { Formik, useFormikContext } from "formik"
import React, { useRef } from "react"
import * as Yup from "yup"

export interface SignUpPasswordStepFormValues {
  password: string
}

export const SignUpPasswordStep: React.FC = () => {
  const navigation = useAuthNavigation()
  const screen = useAuthScreen()

  return (
    <Formik<SignUpPasswordStepFormValues>
      initialValues={{ password: "" }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .min(8, "Your password should be at least 8 characters")
          .matches(/[A-Z]/, "Your password should contain at least one uppercase letter")
          .matches(/[a-z]/, "Your password should contain at least one lowercase letter")
          .matches(/[0-9]/, "Your password should contain at least one digit")
          .required("Password field is required"),
      })}
      onSubmit={async ({ password }, { resetForm }) => {
        await waitForSubmit(500)

        navigation.navigate({
          name: "SignUpNameStep",
          params: {
            email: screen.params?.email,
            password,
          },
        })

        resetForm()
      }}
    >
      <SignUpPasswordStepForm />
    </Formik>
  )
}

const SignUpPasswordStepForm: React.FC = () => {
  const { handleSubmit, isSubmitting, isValid, resetForm } =
    useFormikContext<SignUpPasswordStepFormValues>()

  const navigation = useAuthNavigation()
  const screen = useAuthScreen()
  const passwordRef = useRef<Input>(null)

  useInputAutofocus({
    screenName: "SignUpPasswordStep",
    inputRef: passwordRef,
  })

  const handleBackButtonPress = () => {
    resetForm()
    navigation.goBack()
  }

  return (
    <Flex padding={2}>
      <BackButton onPress={handleBackButtonPress} />

      <Spacer y={1} />

      <Text variant="sm-display">Welcome to Artsy</Text>

      <PasswordInput ref={passwordRef} />

      <Spacer y={2} />

      <Button block width={100} onPress={handleSubmit} disabled={!isValid} loading={isSubmitting}>
        Continue
      </Button>

      {!!screen.params?.showLoginLink && (
        <>
          <Spacer y={1} />

          <Text variant="xs" color="black60" textAlign="center">
            Already have an account?{" "}
            <LinkText
              variant="xs"
              onPress={() => {
                navigation.navigate({
                  name: "LoginPasswordStep",
                  params: { email: screen.params?.email, showSignUpLink: true },
                })
                resetForm()
              }}
            >
              Login.
            </LinkText>
          </Text>
        </>
      )}
    </Flex>
  )
}