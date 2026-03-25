import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import Category from '../models/category.model';
import Cuisine from '../models/cuisine.model';
import Recipe from '../models/recipe.model';

export type State<DocType> = {
  entities: {
    [id: string]: DocType | undefined;
  };
  drafts: {
    [id: string]: DocType | undefined;
  };
};


export const slices = {
  Category: Category.createSlice('Category'),
  Cuisine: Cuisine.createSlice('Cuisine'),
  Recipe: Recipe.createSlice('Recipe'),
};

export const reducers = Object.fromEntries(
  Object.entries(slices).map(([key, slice]) => [key, slice.reducer])
) as { [K in keyof typeof slices]: typeof slices[K]['reducer'] };

const rootReducer = combineReducers(reducers);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export const persistor = persistStore(store);


export type RootState = ReturnType<typeof store.getState>;

export type RootStateKeys = Exclude<keyof RootState, keyof PersistPartial>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => void;


export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector = useSelector.withTypes<RootState>();


export default store;
