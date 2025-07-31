import { ComponentProps, useEffect, useMemo, useState } from "react";
import Cuisine, { ICuisine } from "../../../models/cuisine.model";
import { useAppSelector } from "../../../redux/store";
import CuisineSaveScreen from "../CuisineSaveScreen";

export const useCuisineSave = (params: ComponentProps<typeof CuisineSaveScreen>['route']['params']) => {
  const [form, setForm] = useState<ICuisine>(undefined as any);

  const cuisine = (() => {
    if (!params) {
      return useMemo(() => new Cuisine({
      }), [params]);
    }

    return useAppSelector((state) => {
      return Cuisine.findById(state, params.id);
    });
  })();

  useEffect(() => {
    if (!cuisine || form) return
    setForm(cuisine.toObject());
  }, [cuisine]);

  return { cuisine, form, setForm };
}