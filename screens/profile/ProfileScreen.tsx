import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import { AuthContext } from '../../contexts/AuthContext';
import Recipe from '../../models/recipe.model';
import User from '../../models/user.model';

const Header = ({ authenticatedUser, user, recipes, onLogout }: {
  authenticatedUser: User | null
  user: User
  recipes: Recipe[]
  onLogout: () => void
}) => {
  return (
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

          {(authenticatedUser && user.id == authenticatedUser.id) && (
            <MaterialIcons
              name="logout"
              size={24}
              color="#000"
              onPress={() => onLogout()}
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

      <Text style={styles.bio}>
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
  )
}

const Footer = () => {
  return (
    <View style={{ height: 20 }} />
  )
}


type Props = StaticScreenProps<{
  id: number
}>

export default function ProfileScreen({ route }: Props) {
  const navigation = useNavigation()
  const { user: authenticatedUser, logout } = useContext(AuthContext)
  const [user, setUser] = useState<User>()
  const [recipes, setRecipes] = useState<Recipe[]>()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const user = await User.findById(route.params.id)

      if (!user) {
        navigation.navigate('NotFound')
        return
      }

      navigation.setOptions({
        title: `${user.pseudo}${user.name ? ` (${user.name})` : ''}`,
      })

      const recipes = await Recipe.find({
        author: user.id,
      })
        .sort({ updatedAt: 'descending' })

      setUser(user)
      setRecipes(recipes)
    })

    return unsubscribe
  }, [navigation, route.params.id])

  if (!user || !recipes) {
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          animating
          color="#000"
          size="large"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('Recipe', {
              id: `${item.id}-${slugify(item.title, { lower: true })}`,
            })}
            style={styles.recipe}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={Header({
          authenticatedUser: authenticatedUser,
          user: user,
          recipes: recipes,
          onLogout: () => {
            logout()
              .then(() => {
                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.dispatch(
                    StackActions.replace('Home')
                  )
                }
              })
          },
        })}
        ListFooterComponent={Footer()}
      />

      {(authenticatedUser && user.id == authenticatedUser.id) && (
        <MaterialIcons
          name="add"
          size={32}
          color="#000"
          onPress={() => navigation.navigate('RecipeCreate')}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: '#EAEDE8',
            borderRadius: 360,
            elevation: 5,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.4,
            shadowRadius: 3,
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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