import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../services/api';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await orderAPI.create(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await orderAPI.getMyOrders();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await orderAPI.getOne(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    order: null,
    clientSecret: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrder(state) { state.order = null; state.clientSecret = null; },
    clearOrderError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload.order; s.clientSecret = a.payload.clientSecret; })
      .addCase(createOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyOrders.pending, (s) => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchMyOrders.rejected, (s) => { s.loading = false; })
      .addCase(fetchOrder.pending, (s) => { s.loading = true; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(fetchOrder.rejected, (s) => { s.loading = false; });
  },
});

export const { clearOrder, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
