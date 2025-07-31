import { MaterialIcons } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Category from '../../models/category.model'
import Cuisine from '../../models/cuisine.model'
import Recipe from '../../models/recipe.model'
import { useAppSelector } from '../../redux/store'
import { search } from '../../utils/utils'
import Collapsible from '../atoms/Collapsible'
import { HeaderFilterQuery } from './Header'

type Props = {
  filter: HeaderFilterQuery
  filterCount: number
  onChangeFilter: (filter: HeaderFilterQuery) => void
  onSubmit: () => void
  visible: boolean
  onRequestClose: () => void
}


export default function FilterQueryModal({
  filter,
  filterCount,
  onChangeFilter,
  onSubmit,
  visible,
  onRequestClose,
}: Props) {
  const animation = useRef(new Animated.Value(Dimensions.get('screen').height)).current
  const { recipes, ingredients, categories, cuisines } = useFilterQuery(filter)
  const [includeIngredients, setIncludeIngredients] = useState<string[]>()
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>()

  const top = animation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  })

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
                  {recipes.length} résultats
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
              {Object.values(filter).filter((values) => values.length > 0).length > 0
                ? (
                  <Text
                    onPress={() => onChangeFilter({})}
                    style={{
                      color: '#aaa',
                      marginHorizontal: 16,
                      marginVertical: 26,
                      paddingHorizontal: 16,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Supprimer tous les filtres appliqués
                  </Text>
                )
                : (
                  <Text
                    style={{
                      color: '#aaa',
                      marginHorizontal: 16,
                      marginVertical: 26,
                      paddingHorizontal: 16,
                    }}
                  >
                    Aucun filtre appliqué
                  </Text>
                )}

              <Collapsible
                title={() => (
                  <View
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      Inclure un ingrédient
                    </Text>

                    {filter.includeIngredients && filter.includeIngredients.length > 0 && (
                      <Text
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#888',
                          borderRadius: 360,
                          color: '#fff',
                          lineHeight: 24,
                          marginLeft: 8,
                          textAlign: 'center',
                        }}
                      >
                        {filter.includeIngredients.length}
                      </Text>
                    )}
                  </View>
                )}
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  marginHorizontal: 16,
                }}
              >
                <TextInput
                  placeholder="Rechercher"
                  placeholderTextColor="#a1a1a1"
                  onChangeText={(query) => {
                    setIncludeIngredients(search(query, ingredients))
                  }}
                  style={{
                    borderColor: '#EAEDE8',
                    borderRadius: 4,
                    borderWidth: 1,
                    marginBottom: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 8,
                  }}
                />

                <FlatList
                  data={includeIngredients || ingredients}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const isSelected = filter.includeIngredients?.some((ingredient) => ingredient === item) ?? false

                    return (
                      <Pressable
                        key={item}
                        onPress={() => onChangeFilter({
                          ...filter,
                          includeIngredients: !isSelected
                            ? [...(filter.includeIngredients ?? [])].concat(item)
                            : [...(filter.includeIngredients ?? [])].filter((ingredient) => ingredient !== item)
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
                            includeIngredients: value
                              ? [...(filter.includeIngredients ?? [])].concat(item)
                              : [...(filter.includeIngredients ?? [])].filter((ingredient) => ingredient !== item)
                          })}
                          color="#000"
                        />
                        <Text>
                          {item}
                        </Text>
                      </Pressable>
                    )
                  }}
                  style={{
                    maxHeight: 300,
                  }}
                />
              </Collapsible>

              <Collapsible
                title={() => (
                  <View
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      Exclure un ingrédient
                    </Text>

                    {filter.excludeIngredients && filter.excludeIngredients.length > 0 && (
                      <Text
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#888',
                          borderRadius: 360,
                          color: '#fff',
                          lineHeight: 24,
                          marginLeft: 8,
                          textAlign: 'center',
                        }}
                      >
                        {filter.excludeIngredients.length}
                      </Text>
                    )}
                  </View>
                )}
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  marginBottom: 24,
                  marginHorizontal: 16,
                }}
              >
                <TextInput
                  placeholder="Rechercher"
                  placeholderTextColor="#a1a1a1"
                  onChangeText={(query) => {
                    setExcludeIngredients(search(query, ingredients))
                  }}
                  style={{
                    borderColor: '#EAEDE8',
                    borderRadius: 4,
                    borderWidth: 1,
                    marginBottom: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 8,
                  }}
                />

                <FlatList
                  data={excludeIngredients || ingredients}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const isSelected = filter.excludeIngredients?.some((ingredient) => ingredient === item) ?? false

                    return (
                      <Pressable
                        key={item}
                        onPress={() => onChangeFilter({
                          ...filter,
                          excludeIngredients: !isSelected
                            ? [...(filter.excludeIngredients ?? [])].concat(item)
                            : [...(filter.excludeIngredients ?? [])].filter((ingredient) => ingredient !== item)
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
                            excludeIngredients: value
                              ? [...(filter.excludeIngredients ?? [])].concat(item)
                              : [...(filter.excludeIngredients ?? [])].filter((ingredient) => ingredient !== item)
                          })}
                          color="#000"
                        />
                        <Text>
                          {item}
                        </Text>
                      </Pressable>
                    )
                  }}
                  style={{
                    maxHeight: 300,
                  }}
                />
              </Collapsible>

              <Collapsible
                title={() => (
                  <View
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      Catégorie
                    </Text>

                    {filter.category && filter.category.length > 0 && (
                      <Text
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#888',
                          borderRadius: 360,
                          color: '#fff',
                          lineHeight: 24,
                          marginLeft: 8,
                          textAlign: 'center',
                        }}
                      >
                        {filter.category.length}
                      </Text>
                    )}
                  </View>
                )}
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
                title={() => (
                  <View
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      Cuisine
                    </Text>

                    {filter.cuisine && filter.cuisine.length > 0 && (
                      <Text
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#888',
                          borderRadius: 360,
                          color: '#fff',
                          lineHeight: 24,
                          marginLeft: 8,
                          textAlign: 'center',
                        }}
                      >
                        {filter.cuisine.length}
                      </Text>
                    )}
                  </View>
                )}
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

              <Collapsible
                title={() => (
                  <View
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}
                    >
                      Temps total
                    </Text>

                    {filter.totalTime && filter.totalTime.length > 0 && (
                      <Text
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: '#888',
                          borderRadius: 360,
                          color: '#fff',
                          lineHeight: 24,
                          marginLeft: 8,
                          textAlign: 'center',
                        }}
                      >
                        {filter.totalTime.length}
                      </Text>
                    )}
                  </View>
                )}
                style={{
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 1,
                  marginHorizontal: 16,
                }}
              >
                {[
                  {
                    key: '30',
                    name: 'Moins de 30 minutes'
                  },
                  {
                    key: '30-60',
                    name: 'Entre 30 et 60 minutes'
                  },
                  {
                    key: '60',
                    name: 'Plus de 60 minutes'
                  },
                ].map((totalTime) => {
                  const isSelected = filter.totalTime?.some((id) => id === totalTime.key) ?? false

                  return (
                    <Pressable
                      key={totalTime.key}
                      onPress={() => onChangeFilter({
                        ...filter,
                        totalTime: !isSelected
                          ? [...(filter.totalTime ?? [])].concat(totalTime.key)
                          : [...(filter.totalTime ?? [])].filter((id) => id !== totalTime.key)
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
                          totalTime: value
                            ? [...(filter.totalTime ?? [])].concat(totalTime.key)
                            : [...(filter.totalTime ?? [])].filter((id) => id !== totalTime.key)
                        })}
                        color="#000"
                      />
                      <Text>
                        {totalTime.name}
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
              Voir les résultats ({recipes.length})
            </Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}


const useFilterQuery = (filter: HeaderFilterQuery) => {
  const ingredients = useAppSelector((state) => {
    const recipes = Recipe.findRedux(state)

    return recipes
      .flatMap((recipe) => recipe.steps)
      .flatMap((step) => step.ingredients)
      .map((ingredient) => ingredient.name)
      .filter((ingredient, index, array) => array.indexOf(ingredient) === index)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  })

  const categories = useAppSelector((state) => {
    return Category.findRedux(state)
  })

  const cuisines = useAppSelector((state) => {
    return Cuisine.findRedux(state)
  })

  const recipes = useAppSelector((state) => {
    let result = Recipe.findRedux(state, {
      filter: {
        $and: [
          {
            $or: filter.category
              ?.filter((value) => value)
              .map((value) => ({ category: value }))
              ?? [],
          },
          {
            $or: filter.cuisine
              ?.filter((value) => value)
              .map((value) => ({ cuisine: value }))
              ?? [],
          },
        ],
      },
    })

    if (filter.includeIngredients) {
      const includedIngredients = new Set(filter.includeIngredients)
      result = result.filter((recipe) =>
        recipe.steps.some((step) =>
          step.ingredients.some((ingredient) =>
            includedIngredients.has(ingredient.name)
          )
        )
      )
    }

    if (filter.excludeIngredients) {
      const excludeIngredients = new Set(filter.excludeIngredients)
      result = result.filter((recipe) =>
        !recipe.steps.some((step) =>
          step.ingredients.some((ingredient) =>
            excludeIngredients.has(ingredient.name)
          )
        )
      )
    }

    if (filter.totalTime) {
      result = result.filter((recipe) => {
        const recipeTotalTime = recipe.preparationTime + recipe.cookingTime + recipe.restTime

        return filter.totalTime!
          .some((filterTotalTime) => {
            if (filterTotalTime === '30') {
              return recipeTotalTime <= 30
            } else if (filterTotalTime === '30-60') {
              return recipeTotalTime >= 30 && recipeTotalTime <= 60
            } else if (filterTotalTime === '60') {
              return recipeTotalTime >= 60
            } else {
              return false
            }
          })
      })
    }

    return result
  })


  return { recipes, ingredients, categories, cuisines }
}
