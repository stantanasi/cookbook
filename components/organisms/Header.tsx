import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useHeader } from '../../contexts/HeaderContext';
import FilterQueryModal from './FilterQueryModal';
import LoginModal from './LoginModal';

export type HeaderFilterQuery = {
  includeIngredients?: string[];
  excludeIngredients?: string[];
  category?: string[];
  cuisine?: string[];
  totalTime?: string[];
};

type Props = NativeStackHeaderProps;

export default function Header({ route }: Props) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isSearchVisible, setIsSearchVisible, query, setQuery, filter, setFilter } = useHeader();
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isFilterOptionsVisible, setFilterOptionsVisible] = useState(false);

  const filterCount = Object.values(filter).reduce((acc, cur) => {
    return acc + cur.length;
  }, 0);

  const search = () => {
    navigation.navigate('Search', {
      query: query,
      includeIngredients: filter.includeIngredients?.join(','),
      excludeIngredients: filter.excludeIngredients?.join(','),
      category: filter.category?.join(','),
      cuisine: filter.cuisine?.join(','),
      totalTime: filter.totalTime?.join(','),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          <Image
            style={{
              width: 32,
              height: 32,
            }}
            source={require('../../assets/icon.png')}
          />
        </Pressable>

        <View style={{ flex: 1, marginHorizontal: 8 }} />

        <Pressable
          onPress={() => setIsSearchVisible((prev) => !prev)}
          style={styles.button}
        >
          <MaterialIcons
            name="search"
            size={24}
            color={isSearchVisible ? '#fb743d' : '#000'}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            if (user) {
              navigation.navigate('Profile', { id: user.id });
            } else {
              setLoginModalVisible(true);
            }
          }}
          style={styles.button}
        >
          {user ? (
            <Image
              source={{ uri: user.avatar }}
              style={{
                width: 32,
                height: 32,
                backgroundColor: '#d1d5db',
                borderRadius: 360,
              }}
            />
          ) : (
            <MaterialIcons
              name="person"
              size={24}
              color="#000"
            />
          )}
        </Pressable>
      </View>

      {isSearchVisible && (
        <View
          style={[styles.bar, {
            backgroundColor: '#f7f7f7',
            borderTopColor: '#e6e6e6',
            borderTopWidth: 1,
          }]}
        >
          <View style={styles.button}>
            <MaterialIcons
              name="search"
              size={24}
              color="#000"
            />
          </View>

          <TextInput
            value={query}
            onChangeText={(text) => setQuery(text)}
            onSubmitEditing={() => search()}
            placeholder="Rechercher une recette"
            placeholderTextColor="#a1a1a1"
            returnKeyType="search"
            style={{ flex: 1 }}
          />
          {query != '' && (
            <Pressable
              onPress={() => setQuery('')}
              style={styles.button}
            >
              <MaterialIcons
                name="close"
                size={18}
                color="#a1a1a1"
              />
            </Pressable>
          )}
          
          <Pressable
            onPress={() => setFilterOptionsVisible(true)}
            style={[styles.button, {
              borderLeftColor: '#bbb',
              borderLeftWidth: 1,
            }]}
          >
            <MaterialIcons
              name="tune"
              size={24}
              color="#000"
            />
            {filterCount > 0 && (
              <Text
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
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
          </Pressable>
        </View>
      )}


      <FilterQueryModal
        filter={filter}
        filterCount={filterCount}
        onChangeFilter={(filter) => {
          (Object.keys(filter) as (keyof HeaderFilterQuery)[])
            .forEach((key) => !filter[key]?.length && delete filter[key]);
          setFilter(filter);
        }}
        onSubmit={() => search()}
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    elevation: 5,
    paddingTop: Constants.statusBarHeight,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});