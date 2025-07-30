import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
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

export const rootReducer = combineReducers(reducers);


const store = configureStore({
  reducer: rootReducer,
});


export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => void;


export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector = useSelector.withTypes<RootState>();


export default store;
