import {
  Button,
  Flex,
  HeartIcon,
  Spacer,
  Text,
  useScreenDimensions,
  useSpace,
} from "@artsy/palette-mobile"
import { InfiniteDiscoveryArtworkCard } from "app/Scenes/InfiniteDiscovery/Components/InfiniteDiscoveryArtworkCard"
import { Swiper, SwiperRefProps } from "app/Scenes/InfiniteDiscovery/Components/Swiper/Swiper"
import { InfiniteDiscoveryArtwork } from "app/Scenes/InfiniteDiscovery/InfiniteDiscovery"
import { GlobalStore } from "app/store/GlobalStore"
import { useEffect, useMemo, useRef, useState } from "react"
import { Modal } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import LinearGradient from "react-native-linear-gradient"
import { useSharedValue } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

interface InfiniteDiscoveryOnboardingProps {
  artworks: InfiniteDiscoveryArtwork[]
}

export const InfiniteDiscoveryOnboarding: React.FC<InfiniteDiscoveryOnboardingProps> = ({
  artworks,
}) => {
  const [step, setStep] = useState(0)
  const [showSavedHint, setShowSavedHint] = useState(false)

  const swiperRef = useRef<SwiperRefProps>(null)

  const cards = useMemo(() => {
    return artworks.map((artwork) => (
      <InfiniteDiscoveryArtworkCard
        artwork={artwork}
        key={artwork.internalID}
        scale={0.8}
        containerStyle={{
          borderRadius: 10,
          shadowRadius: 3,
          shadowColor: "black",
          shadowOpacity: 0.2,
          shadowOffset: { height: 0, width: 0 },
        }}
        isSaved={showSavedHint}
      />
    ))
  }, [artworks, showSavedHint])

  const [isVisible, setIsVisible] = useState(false)
  const isRewindRequested = useSharedValue(false)

  const hasInteractedWithOnboarding = GlobalStore.useAppState(
    (state) => state.infiniteDiscovery.hasInteractedWithOnboarding
  )

  useEffect(() => {
    setTimeout(() => {
      if (!hasInteractedWithOnboarding) {
        setIsVisible(true)
      }
    }, 2000)
  }, [hasInteractedWithOnboarding])

  const space = useSpace()
  const { width } = useScreenDimensions()
  const flatlistRef = useRef<FlatList>(null)

  const handleNext = () => {
    const newStep = step + 1

    switch (newStep) {
      case 1:
        swiperRef.current?.swipeLeft()
        break
      case 2:
        setShowSavedHint(false)
        swiperRef.current?.swipeRight()
        break
      case 3:
        setShowSavedHint(true)
        break

      default:
        break
    }

    if (newStep <= STEPS.length) {
      setStep(newStep)
    }
    if (newStep < STEPS.length) {
      flatlistRef.current?.scrollToIndex({ animated: true, index: newStep })
    } else {
      // setIsVisible(false)
    }
  }

  return (
    <Modal animationType="fade" visible={isVisible} transparent>
      <Flex flex={1} backgroundColor="transparent">
        <Flex flex={1}>
          <LinearGradient
            colors={["rgb(255, 255, 255)", `rgba(231, 231, 231, 0.9)`]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          />
          <SafeAreaView
            style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "transparent" }}
          >
            <Flex flex={1} alignSelf="center" justifyContent="center" alignItems="center" py={2}>
              <Swiper
                containerStyle={{ flex: 1, left: "10%" }}
                cards={cards}
                isRewindRequested={isRewindRequested}
                onTrigger={() => {}}
                swipedIndexCallsOnTrigger={2}
                onNewCardReached={() => {}}
                onRewind={() => {}}
                onSwipe={() => {}}
                ref={swiperRef}
              />
            </Flex>

            <Flex justifyContent="flex-end" px={2}>
              <FlatList
                ref={flatlistRef}
                data={STEPS}
                scrollEnabled={false}
                style={{ marginHorizontal: -space(2), flexGrow: 0 }}
                renderItem={({ item }) => (
                  <Flex width={width} px={2} justifyContent="flex-end">
                    {item.title}
                    {item.description}
                  </Flex>
                )}
                keyExtractor={(item) => item.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
              />

              <Spacer y={2} />

              <Flex alignItems="flex-end">
                <Button variant="outline" onPress={handleNext}>
                  {step === STEPS.length - 1 ? "Done" : "Next"}
                </Button>
              </Flex>
            </Flex>
          </SafeAreaView>
        </Flex>
      </Flex>
    </Modal>
  )
}

const STEPS = [
  {
    key: "introduction",
    title: (
      <Text variant="sm-display" color="black60" mb={0.5}>
        Welcome to Discover Daily
      </Text>
    ),
    description: <Text variant="lg-display">A new way of browsing works on Artsy.</Text>,
  },
  {
    key: "swipeArtworks",
    description: <Text variant="lg-display">Swipe artworks to the left to see the next work</Text>,
  },
  {
    key: "favouriteArtworks",
    description: (
      <Text variant="lg-display">
        Press <HeartIcon height={24} width={24} /> when you like an artwork you see
      </Text>
    ),
  },
]
