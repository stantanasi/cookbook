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
  const { query, setQuery, filter, setFilter } = useHeader();
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
        <View style={styles.searchInput}>
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
            <MaterialIcons
              name="close"
              size={18}
              color="#a1a1a1"
              onPress={() => setQuery('')}
            />
          )}
        </View>
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

      {user ? (
        <Pressable
          onPress={() => navigation.navigate('Profile', { id: user.id })}
        >
          <Image
            source={{ uri: user.avatar }}
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#d1d5db',
              borderColor: '#d1d5db',
              borderRadius: 360,
              borderWidth: 1,
            }}
          />
        </Pressable>
      ) : (
        <MaterialIcons
          name="person"
          size={24}
          color="#000"
          onPress={() => setLoginModalVisible(true)}
          style={{ padding: 4 }}
        />
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
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
});