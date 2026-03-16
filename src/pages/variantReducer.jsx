export const initialState = {
  variants: [],
  loading: false,
  searchTerm: "",
  cursor: 0,
  hasNext: false,
  isAddModalOpen: false,
  editingVariant: null,
  showDeleteModal: false,
  idToDelete: null,
  error: null,
  validationErrors: [],
  isVerified: false,
  selectedFile: null,
  showValidationModal: false,
};

export function variantReducer(state, action) {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        variants: action.payload.variants,
        hasNext: action.payload.hasNext,
        cursor:
          action.payload.variants.length > 0
            ? action.payload.variants[action.payload.variants.length - 1]
                .variantId
            : state.cursor,
      };
    case "WS_UPDATE":
      const exists = state.variants.find(
        (v) => v.variantId === action.payload.variantId,
      );
      return {
        ...state,
        variants: exists
          ? state.variants.map((v) =>
              v.variantId === action.payload.variantId ? action.payload : v,
            )
          : [action.payload, ...state.variants],
      };
    case "SET_SEARCH":
      return { ...state, searchTerm: action.payload };
    case "SET_SELECTED_FILE":
      return { ...state, selectedFile: action.payload };
    case "SET_DELETE_TARGET":
      return { ...state, idToDelete: action.payload, showDeleteModal: true };
    case "OPEN_ADD_MODAL":
      return { ...state, isAddModalOpen: true, editingVariant: null };
    case "OPEN_EDIT_MODAL":
      return { ...state, editingVariant: action.payload };
    case "CLOSE_MODALS":
      return {
        ...state,
        isAddModalOpen: false,
        editingVariant: null,
        showDeleteModal: false,
        showValidationModal: false,
      };
    case "SET_VERIFIED":
      return {
        ...state,
        loading: false,
        isVerified: action.payload,
        validationErrors: action.errors || [],
        showValidationModal: !action.payload && action.errors?.length > 0,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
