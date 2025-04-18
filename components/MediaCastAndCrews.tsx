import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Pressable,
  Animated,
} from "react-native";
import { View, Text } from "./Themed";
import { useColorScheme } from "./useColorScheme";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  const initials = parts.map(part => part.charAt(0)).slice(0, 2).join("");
  return initials.toUpperCase();
};

const MediaCastAndCrews = ({ cast }: { cast: any[] }) => {
  const colorScheme = useColorScheme();
  const castImageBgColor = colorScheme === "dark" ? "#0f0f0f" : "#f0f0f0";
  const castTextColor = colorScheme === "dark" ? "#ffffff" : "#000000";

  return (
    <>
      {cast.length > 0 && (
        <View style={styles.container}>
          <View style={styles.castCrewContainer}>
            <Text style={styles.castCrew}>Cast & Crew</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cast.map((member) => {
              const hasImage = !!member.profile_path;
              const scaleAnim = useState(() => new Animated.Value(1))[0];

              const handleHoverIn = () => {
                if (Platform.OS === "web") {
                  Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    useNativeDriver: true,
                  }).start();
                }
              };

              const handleHoverOut = () => {
                if (Platform.OS === "web") {
                  Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                  }).start();
                }
              };

              const Wrapper = Platform.OS === "web" ? Pressable : View;

              return (
                <Wrapper
                  key={member.id}
                  onHoverIn={handleHoverIn}
                  onHoverOut={handleHoverOut}
                  style={{ marginRight: 15 }}
                >
                  <Animated.View
                    style={[
                      styles.castContainer,
                      {
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    {hasImage ? (
                      <Image
                        source={{ uri: `${IMAGE_BASE_URL}${member.profile_path}` }}
                        style={[
                          styles.profileImage,
                          {
                            backgroundColor: castImageBgColor,
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.placeholderImage,
                          {
                            backgroundColor: castImageBgColor,
                          },
                        ]}
                      >
                        <Text style={[styles.initials, { color: castTextColor }]}>
                          {getInitials(member.name)}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.name, { color: castTextColor }]} numberOfLines={1}>
                      {member.name}
                    </Text>
                    <Text
                      style={[styles.character, { color: castTextColor }]}
                      numberOfLines={1}
                    >
                      {member.character || member.name}
                    </Text>
                  </Animated.View>
                </Wrapper>
              );
            })}
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  castContainer: {
    alignItems: "center",
    width: 110,
    marginTop: 30,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  initials: {
    fontSize: 25,
    color: "#ffffff",
  },
  name: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    color: "#ffffff",
  },
  character: {
    marginTop: 2,
    fontSize: 10,
    textAlign: "center",
    color: "#ffffff",
  },
  castCrewContainer: {
    flex: 1,
  },
  castCrew: {
    fontWeight: "bold",
    marginVertical: 10,
    fontSize: 15,
  },
});

export default MediaCastAndCrews;
