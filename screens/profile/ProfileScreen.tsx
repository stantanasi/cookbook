import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../components/Recipe';
import { AuthContext } from '../../contexts/AuthContext';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import UserModel, { IUser } from '../../models/user.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

export default function ProfileScreen({ navigation, route }: Props) {
  const { user: currentUser, logout } = useContext(AuthContext)
  const [user, setUser] = useState<IUser>()
  const [recipes, setRecipes] = useState<Model<IRecipe>[]>([])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const user = route.params?.id
        ? await UserModel.findById(route.params.id)
        : currentUser

      if (!user) {
        navigation.navigate('Home')
        return
      }

      setUser(user)

      const recipes = await RecipeModel.find({
        author: user.id,
      })
        .sort({ updatedAt: 'descending' })

      setRecipes(recipes)
    })

    return unsubscribe
  }, [navigation, route.params?.id])

  if (!user) {
    return <View></View>
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('Recipe', { id: item.id.toString() })}
          style={styles.recipe}
        >
          <Recipe recipe={item} />
        </Pressable>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListHeaderComponent={() => (
        <View>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/banner.jpg')}
              resizeMode="cover"
              style={styles.banner}
            />

            <View style={styles.headerButtons}>
              <Ionicons
                name="logo-github"
                size={24}
                color="#000"
                onPress={() => Linking.openURL(user.url)}
                style={styles.headerButton}
              />

              {(user.id === currentUser?.id) && (
                <MaterialIcons
                  name="logout"
                  size={24}
                  color="#000"
                  onPress={() => {
                    logout()
                      .then(() => navigation.navigate('Home'))
                  }}
                  style={styles.headerButton}
                />
              )}
            </View>

            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.username}>
            {user.name ?? user.pseudo}
          </Text>
          <Text style={styles.pseudo}>
            @{user.pseudo}
          </Text>

          <Text style={styles.bio}          >
            {user.bio}
          </Text>

          <View style={styles.metas}>
            <View style={styles.meta}>
              <Text style={styles.metaValue}>
                {recipes.length}
              </Text>
              <Text style={styles.metaLabel}>
                Recettes
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.meta}>
              <Text style={styles.metaValue}>
                {user.followers}
              </Text>
              <Text style={styles.metaLabel}>
                Abonnés
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.meta}>
              <Text style={styles.metaValue}>
                {user.following}
              </Text>
              <Text style={styles.metaLabel}>
                Abonnements
              </Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </View>
      )}
      ListFooterComponent={() => <View style={{ height: 20 }} />}
    />
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    gap: 16,
    margin: 16,
  },
  headerButton: {
    backgroundColor: '#fff',
    borderRadius: 360,
    padding: 8,
  },
  avatar: {
    position: 'absolute',
    bottom: 0,
    width: 100,
    height: 100,
    borderColor: '#fff',
    borderRadius: 360,
    borderWidth: 6,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  pseudo: {
    color: '#a1a1a1',
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  bio: {
    marginTop: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  metas: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  meta: {
    alignItems: 'center',
    flex: 1,
  },
  metaValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metaLabel: {},
  metaDivider: {
    width: 1,
    backgroundColor: '#EAEDE8',
  },
  recipe: {
    marginHorizontal: 16,
  },
})