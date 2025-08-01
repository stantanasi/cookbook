import AsyncStorage from '@react-native-async-storage/async-storage';
import { isJson } from './utils';

class AsyncStorageItem<T> {

  constructor(
    private key: string,
  ) { }


  set = async (object: T) => {
    if (typeof object === 'object') {
      return AsyncStorage.setItem(this.key, JSON.stringify(object));
    } else if (typeof object === 'string') {
      return AsyncStorage.setItem(this.key, object);
    } else {
      return AsyncStorage.setItem(this.key, object as any);
    }
  };

  get = async (): Promise<T | null> => {
    const value = await AsyncStorage.getItem(this.key);
    if (value == null) {
      return value;
    } else if (isJson(value)) {
      return JSON.parse(value);
    } else {
      return value as T;
    }
  };

  remove = async () => {
    return AsyncStorage.removeItem(this.key);
  };
}


const AsyncStorageUtils = {
  clear: async () => {
    return AsyncStorage.clear();
  },

  GITHUB_TOKEN: new AsyncStorageItem<string>('github_token'),
};

export default AsyncStorageUtils;