import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import Checkbox from 'expo-checkbox';
import Constants from 'expo-constants';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import CategoryModel, { ICategory } from '../../models/category.model';
import CuisineModel, { ICuisine } from '../../models/cuisine.model';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { SearchFilterQuery } from '../../screens/search/SearchScreen';
import { Model } from '../../utils/mongoose';
import Collapsible from '../atoms/Collapsible';

export type HeaderFilterQuery = {
  [P in keyof IRecipe]?: IRecipe[P][]
}

const FilterQueryModal = ({ filter, filterCount, onChangeFilter, onSubmit, visible, onRequestClose }: {
  filter: HeaderFilterQuery
  filterCount: number
  onChangeFilter: (filter: HeaderFilterQuery) => void
  onSubmit: () => void
  visible: boolean
  onRequestClose: () => void
}) => {
  const animation = useRef(new Animated.Value(Dimensions.get('screen').height)).current
  const [categories, setCategories] = useState<Model<ICategory>[]>([])
  const [cuisines, setCuisines] = useState<Model<ICuisine>[]>([])
  const [recipeCount, setRecipeCount] = useState(0)

  const top = animation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  })

  useEffect(() => {
    CategoryModel.find()
      .then((categories) => setCategories(categories))
    CuisineModel.find()
      .then((cuisines) => setCuisines(cuisines))
  }, [])

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start()
    } else {
      Animated.timing(animation, {
        toValue: Dimensions.get('screen').height,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }
  }, [visible])

  useEffect(() => {
    RecipeModel.count({
      $and: Object.entries(filter)
        .map(([path, values]) => {
          return {
            $or: values
              .map((value) => {
                return { [path]: value }
              })
          }
        })
    }).then((count) => setRecipeCount(count))
  }, [filter])

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => onRequestClose()}
      transparent
      visible={visible}
    >
      <Pressable
        onPress={() => onRequestClose()}
        style={{
          backgroundColor: '#00000052',
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Animated.View
          style={[{
            backgroundColor: '#fff',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            flex: 1,
            marginTop: 100,
          }, { top: top }]}
        >
          <Pressable style={{ flex: 1 }}>
            <View
              style={{
                alignItems: 'center',
                borderBottomColor: '#ddd',
                borderBottomWidth: 1,
                flexDirection: 'row',
                padding: 16,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 20,
                  fontWeight: 'bold',
                }}
              >
                Filtres ({filterCount})
                <Text
                  style={{
                    color: '#888',
                    fontSize: 16,
                    marginLeft: 10,
                  }}
                >
                  {recipeCount} résultats
                </Text>
              </Text>
              <MaterialIcons
                name="close"
                size={24}
                color="#000"
                onPress={() => onRequestClose()}
              />
            </View>

            <ScrollView style={{ flex: 1 }}>
              <Collapsible
                title="Catégorie"
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  marginHorizontal: 16,
                }}
              >
                {categories.map((category) => {
                  const isSelected = filter.category?.some((id) => id.toString() === category.id.toString()) ?? false

                  return (
                    <Pressable
                      key={category.id.toString()}
                      onPress={() => onChangeFilter({
                        ...filter,
                        category: !isSelected
                          ? [...(filter.category ?? [])].concat(category.id)
                          : [...(filter.category ?? [])].filter((id) => id.toString() !== category.id.toString())
                      })}
                      style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: 4,
                        flexDirection: 'row',
                        gap: 10,
                        marginTop: 4,
                        padding: 16,
                      }}
                    >
                      <Checkbox
                        value={isSelected}
                        onValueChange={(value) => onChangeFilter({
                          ...filter,
                          category: value
                            ? [...(filter.category ?? [])].concat(category.id)
                            : [...(filter.category ?? [])].filter((id) => id.toString() !== category.id.toString())
                        })}
                        color="#000"
                      />
                      <Text>
                        {category.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </Collapsible>

              <Collapsible
                title="Cuisine"
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  marginHorizontal: 16,
                }}
              >
                {cuisines.map((cuisine) => {
                  const isSelected = filter.cuisine?.some((id) => id.toString() === cuisine.id.toString()) ?? false

                  return (
                    <Pressable
                      key={cuisine.id.toString()}
                      onPress={() => onChangeFilter({
                        ...filter,
                        cuisine: !isSelected
                          ? [...(filter.cuisine ?? [])].concat(cuisine.id)
                          : [...(filter.cuisine ?? [])].filter((id) => id.toString() !== cuisine.id.toString())
                      })}
                      style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: 4,
                        flexDirection: 'row',
                        gap: 10,
                        marginTop: 4,
                        padding: 16,
                      }}
                    >
                      <Checkbox
                        value={isSelected}
                        onValueChange={(value) => onChangeFilter({
                          ...filter,
                          cuisine: value
                            ? [...(filter.cuisine ?? [])].concat(cuisine.id)
                            : [...(filter.cuisine ?? [])].filter((id) => id.toString() !== cuisine.id.toString())
                        })}
                        color="#000"
                      />
                      <Text>
                        {cuisine.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </Collapsible>
            </ScrollView>

            <Text
              onPress={() => {
                onSubmit()
                onRequestClose()
              }}
              style={{
                backgroundColor: '#000',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 'bold',
                marginHorizontal: 20,
                marginVertical: 24,
                padding: 16,
                textAlign: 'center',
              }}
            >
              Voir les résultats ({recipeCount})
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}

const LoginModal = ({ visible, onRequestClose }: {
  visible: boolean
  onRequestClose: () => void
}) => {
  const { login } = useContext(AuthContext)
  const [token, setToken] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const panY = useRef(new Animated.Value(Dimensions.get('screen').height)).current;

  const top = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  })

  useEffect(() => {
    if (visible) {
      Animated.timing(panY, {
        useNativeDriver: false,
        toValue: 0,
        duration: 300,
      }).start();
    } else {
      Animated.timing(panY, {
        useNativeDriver: false,
        toValue: Dimensions.get('screen').height,
        duration: 500,
      }).start()
    }
  }, [visible])

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => onRequestClose()}
      transparent
      visible={visible}
    >
      <Pressable
        onPress={() => onRequestClose()}
        style={{
          backgroundColor: '#00000052',
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Animated.View
          style={[{
            backgroundColor: '#fff',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }, { top }]}
        >
          <Pressable>
            <View
              style={{
                alignItems: 'center',
                borderBottomColor: '#ddd',
                borderBottomWidth: 1,
                flexDirection: 'row',
                padding: 16,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                Connexion
              </Text>
              <MaterialIcons
                name="close"
                size={24}
                color="#000"
                onPress={() => onRequestClose()}
              />
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                paddingHorizontal: 16,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Me connecter
            </Text>

            <TextInput
              value={token}
              onChangeText={(value) => setToken(value)}
              placeholder="GitHub API Token"
              placeholderTextColor="#a1a1a1"
              secureTextEntry
              style={{
                borderColor: '#EAEDE8',
                borderRadius: 4,
                borderWidth: 1,
                marginTop: 24,
                marginHorizontal: 20,
                paddingHorizontal: 6,
                paddingVertical: 8,
              }}
            />

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#000',
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 12,
                marginHorizontal: 20,
                marginVertical: 24,
                padding: 16,
              }}
            >
              <Text
                onPress={async () => {
                  setIsLogging(true)

                  await login(token)
                    .then(() => onRequestClose())
                    .catch((err) => console.error(err))
                    .finally(() => setIsLogging(false))
                }}
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                Se connecter
              </Text>
              <ActivityIndicator
                animating={isLogging}
                color="#fff"
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}


type Props = NativeStackHeaderProps & {
  query: string
  onChangeQuery: (query: string) => void
  filter: HeaderFilterQuery
  onChangeFilter: (filter: HeaderFilterQuery) => void
}

export default function Header({ query, onChangeQuery, filter, onChangeFilter, ...props }: Props) {
  const navigation = props.navigation as NativeStackNavigationProp<RootStackParamList>
  const { user } = useContext(AuthContext)
  const [isLoginModalVisible, setLoginModalVisible] = useState(false)
  const [isFilterOptionsVisible, setFilterOptionsVisible] = useState(false)
  const filterCount = Object.values(filter).reduce((acc, cur) => {
    return acc + cur.length
  }, 0)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.navigate('Home')}
      >
        <Image
          style={styles.logo}
          source={require('../../assets/icon.png')}
        />
      </Pressable>

      <View style={styles.search}>
        <MaterialIcons name="search" size={20} color="#000" />
        <TextInput
          value={query}
          onChangeText={(text) => onChangeQuery(text)}
          onSubmitEditing={() => {
            navigation.navigate('Search', {
              ...Object.entries(filter).reduce((acc, [path, values]) => {
                acc[path as keyof HeaderFilterQuery] = values.map((value) => value?.toString()).join(',')
                return acc
              }, {} as SearchFilterQuery),
              query: query,
            })
          }}
          placeholder="Rechercher une recette"
          placeholderTextColor="#a1a1a1"
          style={styles.searchInput}
        />
        <View>
          <MaterialIcons
            name="tune"
            size={22}
            color="#000"
            onPress={() => setFilterOptionsVisible(true)}
          />
          {filterCount > 0 && (
            <Text
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                borderRadius: 360,
                backgroundColor: '#777',
                color: '#fff',
                fontSize: 10,
                paddingHorizontal: 4,
              }}
            >
              {filterCount}
            </Text>
          )}
        </View>
      </View>

      <MaterialIcons
        name="person"
        size={24}
        color="#000"
        onPress={() => {
          if (user) {
            navigation.navigate('Profile', { id: user.id })
          } else {
            setLoginModalVisible(true)
          }
        }}
      />

      <FilterQueryModal
        filter={filter}
        filterCount={filterCount}
        onChangeFilter={(filter) => onChangeFilter(filter)}
        onSubmit={() => {
          navigation.navigate('Search', {
            ...Object.entries(filter).reduce((acc, [path, values]) => {
              acc[path as keyof HeaderFilterQuery] = values.map((value) => value?.toString()).join(',')
              return acc
            }, {} as SearchFilterQuery),
            query: query,
          })
        }}
        visible={isFilterOptionsVisible}
        onRequestClose={() => setFilterOptionsVisible(false)}
      />
      {!user && (
        <LoginModal
          visible={isLoginModalVisible}
          onRequestClose={() => setLoginModalVisible(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 5,
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: Constants.statusBarHeight + 8,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  logo: {
    height: 32,
    width: 32,
  },
  search: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 8,
  },
  searchInput: {
    flex: 1,
  },
})