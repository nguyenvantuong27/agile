import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rtkQueryLogger } from '../../middlewares/rtkQueryLogger/rtkQueryLogger';
import storage from 'redux-persist/lib/storage';
import { categoriesMenuApi } from '../../services/categories_menu/categories_menu.services';
import { blogApi } from '../../services/blog/blog.services';
import { authApi } from '../../services/auth/auth.services';
import { branchApi } from '~/services/branches/branches.services';
import { logoutApi } from '~/services/auth/logout.services';
import { tattooApi } from '~/services/tattoos/tattoos.services';
import { usersApi } from '~/services/users/user.services';
import { reviewApi } from '~/services/review/review.services';
import { listProductApi } from '~/services/list_product/list_product.services';
import { productApi } from '~/services/product/product.services';
import { timeslotApi } from '~/services/timeslots/timeslots.services';
import { appointmentApi } from '~/services/appointments/appointments.services';
import { descriptionApi } from '~/services/description/description.services';
import { cartApi } from '~/services/cart/cart.services';
import { cartDetailsApi } from '~/services/cart-details/cart-details.services';
import { paymentApi } from '~/services/payment/payment.services';
import { orderApi } from '~/services/order/order.services';
import { orderDetailApi } from '~/services/order-details/order-details.services';
import { favoriteApi } from '~/services/favorite/favorite.services';
import { commentBlogApi } from '~/services/comment-blog/comment_blogs.services';
import { voucherApi } from '~/services/voucher/voucher.services';
import { contactApi } from '~/services/contacts/contact.services';
import { appointmentCategoriesApi } from '~/services/appointment_categories/appointment_categories.services';

import authSlice from '../../services/auth/auth.slice';
import historySlice from '../../services/history/histoty.slice';
import cartSlice from '../cartSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'history'],
};

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [categoriesMenuApi.reducerPath]: categoriesMenuApi.reducer,
  [blogApi.reducerPath]: blogApi.reducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [logoutApi.reducerPath]: logoutApi.reducer,
  [tattooApi.reducerPath]: tattooApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [reviewApi.reducerPath]: reviewApi.reducer,
  [listProductApi.reducerPath]: listProductApi.reducer,
  [productApi.reducerPath]: productApi.reducer,
  [timeslotApi.reducerPath]: timeslotApi.reducer,
  [appointmentApi.reducerPath]: appointmentApi.reducer,
  [descriptionApi.reducerPath]: descriptionApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [cartDetailsApi.reducerPath]: cartDetailsApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [orderDetailApi.reducerPath]: orderDetailApi.reducer,
  [favoriteApi.reducerPath]: favoriteApi.reducer,
  [commentBlogApi.reducerPath]: commentBlogApi.reducer,
  [voucherApi.reducerPath]: voucherApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [appointmentCategoriesApi.reducerPath]: appointmentCategoriesApi.reducer,

  auth: authSlice,
  history: historySlice,
  cart: cartSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authApi.middleware,
      categoriesMenuApi.middleware,
      blogApi.middleware,
      branchApi.middleware,
      logoutApi.middleware,
      tattooApi.middleware,
      usersApi.middleware,
      reviewApi.middleware,
      listProductApi.middleware,
      productApi.middleware,
      timeslotApi.middleware,
      appointmentApi.middleware,
      descriptionApi.middleware,
      cartDetailsApi.middleware,
      paymentApi.middleware,
      cartApi.middleware,
      orderApi.middleware,
      orderDetailApi.middleware,
      favoriteApi.middleware,
      commentBlogApi.middleware,
      voucherApi.middleware,
      contactApi.middleware,
      appointmentCategoriesApi.middleware,
      rtkQueryLogger,
    ),
  devTools: import.meta.env.MODE !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default { store, persistor };
