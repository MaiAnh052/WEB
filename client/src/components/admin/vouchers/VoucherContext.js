export const voucherState = {
  vouchers: [],
  addVoucherModal: false,
  editVoucherModal: {
    modal: false,
    vId: null,
    voucher: null,
  },
  loading: false,
};

export const voucherReducer = (state, action) => {
  switch (action.type) {
    /* Get all vouchers */
    case "fetchVoucherAndChangeState":
      return {
        ...state,
        vouchers: action.payload,
      };
    /* Create a voucher */
    case "addVoucherModal":
      return {
        ...state,
        addVoucherModal: action.payload,
      };
    /* Edit a voucher */
    case "editVoucherModalOpen":
      return {
        ...state,
        editVoucherModal: {
          modal: true,
          vId: action.vId,
          voucher: action.voucher,
        },
      };
    case "editVoucherModalClose":
      return {
        ...state,
        editVoucherModal: {
          modal: false,
          vId: null,
          voucher: null,
        },
      };
    case "loading":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

