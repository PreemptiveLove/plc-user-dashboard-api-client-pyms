import { SpraypaintBase, attr, belongsTo, hasMany, hasOne } from "spraypaint";

const jwtDecode = require('jwt-decode');

const ApplicationRecord = SpraypaintBase.extend({
  static: {
    jwtStorage:         "plcJwt",
    baseUrl:            "",
    apiNamespace:       "",
    generateAuthHeader: function(token) {
      return "Bearer " + token;
    }
  }
})

const authenticate = (email, password) => {
  const requestBody = JSON.stringify({
      "email":    email,
      "password": password
  });
  const requestOptions = {
    method:       "POST",
    body:         requestBody,
    headers:      { "Content-Type": "application/json" },
    credentials:  "same-origin"
  };

  return fetch(`${ApplicationRecord.baseUrl}/plc_user_tokens`, requestOptions).then((response) => {
    return new Promise((resolve, reject) => {
      if (response.ok) {
        return response.json().then((json) => {
          const jwt = json.plcJwt
          localStorage.setItem("plcJwt", jwt);
          resolve({ jwt: jwt });
        });
      } else {
        return response.json().then((response) => {
          reject(response);
        });
      }
    });
  });
}

const authenticateFromUrl = (urlString) => {
  let params = new URL(urlString).searchParams;
  const jwt = params.get('plcJwt')
  return new Promise((resolve, reject) => {
    if (jwt != null) {
      localStorage.setItem('plcJwt', jwt);
      resolve({ jwt: jwt });
    } else {
      reject(false);
    }
  });
}

const isAuthenticated = () => {
  let flag = false;
  const jwt = localStorage.getItem("plcJwt");
  if (jwt != null) {
    const decodedJwt = jwtDecode(jwt);
    const now = Date.now().valueOf() / 1000;
    if (typeof decodedJwt.exp === 'undefined' || now < decodedJwt.exp) {
      flag = true;
    } else {
      localStorage.removeItem("plcJwt");
    }
  }
  return flag;
}

const requestLoginLink = (email) => {
  const requestBody = JSON.stringify({
    email: email
  });
  const requestOptions = {
    method:       "POST",
    body:         requestBody,
    headers:      { "Content-Type": "application/json" },
    credentials:  "same-origin"
  };
  return fetch(`${ApplicationRecord.baseUrl}/plc_user_login_links`, requestOptions).then((response) => {
    return new Promise((resolve, reject) => {
      if (response.ok) {
        return resolve(response);
      } else {
        return reject(response);
      }
    });
  });
}

const resetPassword = (password, email) => {
  var email = email;
  // if(!email && !empty(email) && email !=='' )
  //   localStorage.getItem('plcJwt', jwt);
  const requestBody = JSON.stringify({
    "data": {
        "attributes": {
          "email": email,
          "password": password
        }
    }
  });
  const requestOptions = {
    method:       "POST",
    body:         requestBody,
    headers:      { "Content-Type": "application/json",
                  },
    credentials:  "same-origin"
  };

  return fetch(`${ApplicationRecord.baseUrl}/plc_reset_password`, requestOptions).then((response) => {
    return new Promise((resolve, reject) => {
      if (response.ok) {
        return response.json().then((json) => {
          // const jwt = json.plcJwt
          // localStorage.setItem("plcJwt", jwt);
          resolve(json);
        });
      } else {
        return response.json().then((response) => {
          reject(response);
        });
      }
    });
  });
}

const cancelSubscription = (id, fields) => {
  console.log(id);
  console.log(fields);
  var cancelReason = fields.cancellationReason;
  var cancellationReason = fields.cancellationReasonDescription;
  const jwt = localStorage.getItem("plcJwt");
  const requestBody = JSON.stringify({
    subscriptionId: id,
    cancelReason: cancelReason,
    cancellationReason: cancellationReason
  });
  console.log("requestBody");
  console.log(requestBody);
  const requestOptions = {
    method:       "POST",
    body:         requestBody,
    headers:      { "Content-Type": "application/json" },
    credentials:  "same-origin",
    Authorization: "Bearer "+jwt
  };
  return fetch(`${ApplicationRecord.baseUrl}/cancel_subscription`, requestOptions).then((response) => {
    return new Promise((resolve, reject) => {
      if (response.ok) {
        return resolve(response);
      } else {
        return reject(response);
      }
    });
  });
}

const logout = () => {
  return localStorage.removeItem("plcJwt");
}

const PlcUser = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_users"
  },
  attrs: {
    plcTransactions:      hasMany(),
    plcSubscriptions:     hasMany(),
    firstName:            attr(),
    lastName:             attr(),
    email:                attr(),
    password:             attr(),
    facebook:             attr(),
    firstDonationDate:    attr({ persist: false }),
    gender:               attr(),
    hasOptedOutOfEmail:   attr(),
    instagram:            attr(),
    lastDonationDate:     attr({ persist: false }),
    linkedin:             attr(),
    mailOptOut:           attr(),
    mailingCity:          attr(),
    mailingCountry:       attr(),
    mailingPostalCode:    attr(),
    mailingState:         attr(),
    mailingStreet:        attr(),
    maritalStatus:        attr(),
    middleName:           attr(),
    mobilePhone:          attr(),
    parentalStatus:       attr(),
    phone:                attr(),
    religion:             attr(),
    title:                attr(),
    twitter:              attr(),
    birthdate:            attr(),
    firstPurchaseDate:    attr({ persist: false }),
    firstTransactionDate: attr({ persist: false }),
    gravatarDigest:       attr({ persist: false })
  }
})

const PlcTransaction = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_transactions"
  },
  attrs: {
    plcUser:                belongsTo(),
    plcSubscription:        belongsTo(),
    plcCampaign:            belongsTo(),
    plcLineItems:           hasMany(),
    amount:                 attr({ persist: false }),
    closeDate:              attr({ persist: false }),
    digitalWalletService:   attr({ persist: false }),
    isClosed:               attr({ persist: false }),
    isWon:                  attr({ persist: false }),
    isRefund:               attr({ persist: false }),
    shopifyDiscountAmount:  attr({ persist: false }),
    shopifyDiscountCode:    attr({ persist: false }),
    stageName:              attr({ persist: false }),
    taxDeductibleAmount:    attr({ persist: false }),
    transactionType:        attr({ persist: false }),
    stripeTransactionId:    attr({ persist: false }),
    authorizeTransactionId: attr({ persist: false }),
    paypalTransactionId:    attr({ persist: false }),
    shopifyTransactionId:   attr({ persist: false }),
    belongsToSubscription:  attr({ persist: false })
  }
})

const PlcSubscription = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_subscriptions"
  },
  attrs: {
    plcPaymentMethod: hasOne(),
    plcUser:          belongsTo(),
    plcCampaign:      belongsTo(),
    cancelDate:       attr({ persist: false }),
    amount:           attr(),
    dateEstablished:  attr({ persist: false }),
    installments:     attr({ persist: false }),
    lastPaymentDate:  attr({ persist: false }),
    nextPaymentDate:  attr(),
    openEndedStatus:  attr(),
    paymentProcessor: attr({ persist: false }),
    cancellationReasonDescription: attr(),
    cancellationReason: attr()
  }
})

const PlcProduct = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_products"
  },
  attrs: {
    isActive:       attr({ persist: false }),
    isDonation:     attr({ persist: false }),
    isProduct:      attr({ persist: false }),
    isRefugeeMade:  attr({ persist: false }),
    productCode:    attr({ persist: false }),
    sku:            attr({ persist: false }),
    name:           attr({ persist: false })
  }
})

const PlcLineItem = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_line_items"
  },
  attrs: {
    plcTransaction: belongsTo(),
    plcProduct:     belongsTo(),
    isDonation:     attr({ persist: false }),
    isProduct:      attr({ persist: false }),
    listPrice:      attr({ persist: false }),
    name:           attr({ persist: false }),
    productCode:    attr({ persist: false }),
    quantity:       attr({ persist: false }),
    taxableAmount:  attr({ persist: false }),
    totalPrice:     attr({ persist: false }),
    unitPrice:      attr({ persist: false })
  }
})

const PlcCampaign = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_campaigns"
  },
  attrs: {
    plcTransactions:        hasMany(),
    plcSubscriptions:       hasMany(),
    endDate:                attr({ persist: false }),
    isActive:               attr({ persist: false }),
    name:                   attr({ persist: false }),
    startDate:              attr({ persist: false }),
    originatingLandingPage: attr({ persist: false }),
    uniqueName:             attr({ persist: false }),
    displayName:            attr({ persist: false })
  }
})

const PlcPaymentMethod = ApplicationRecord.extend({
  static: {
    jsonapiType: "plc_payment_methods"
  },
  attrs: {
    plcSubscriptions: belongsTo(),
    stripeCustomerId: attr({ persist: false }),
    stripeSourceId:   attr({ persist: false }),
    addressCity:      attr({ persist: false }),
    addressCountry:   attr({ persist: false }),
    addressLine1:     attr({ persist: false }),
    addressLine2:     attr({ persist: false }),
    addressState:     attr({ persist: false }),
    addressZip:       attr({ persist: false }),
    brand:            attr({ persist: false }),
    country:          attr({ persist: false }),
    expirationMonth:  attr({ persist: false }),
    expirationYear:   attr({ persist: false }),
    last4:            attr({ persist: false }),
    bankName:         attr({ persist: false }),
    routingNumber:    attr({ persist: false }),
    updateToken:      attr()
  }
})

const setBaseUrl = (baseUrl) => {
  ApplicationRecord.baseUrl = baseUrl;
  PlcUser.baseUrl = baseUrl;
  PlcCampaign.baseUrl = baseUrl;
  PlcLineItem.baseUrl = baseUrl;
  PlcPaymentMethod.baseUrl = baseUrl;
  PlcProduct.baseUrl = baseUrl;
  PlcSubscription.baseUrl = baseUrl;
  PlcTransaction.baseUrl = baseUrl;
}

const setEnvironment = (env) => {
  if (env == 'production') {
    setBaseUrl("https://donors-accounts.prod.paymentpreemptivelove.com");
  } else {
    setBaseUrl("https://donors-accounts.stg.paymentpreemptivelove.com");
  }
}

module.exports = {
  authenticate: authenticate,
  authenticateFromUrl: authenticateFromUrl,
  isAuthenticated: isAuthenticated,
  requestLoginLink: requestLoginLink,
  resetPassword: resetPassword,
  cancelSubscription: cancelSubscription,
  logout: logout,
  PlcUser: PlcUser,
  PlcTransaction: PlcTransaction,
  PlcSubscription: PlcSubscription,
  PlcProduct: PlcProduct,
  PlcLineItem: PlcLineItem,
  PlcCampaign: PlcCampaign,
  PlcPaymentMethod: PlcPaymentMethod,
  setBaseUrl: setBaseUrl,
  setEnvironment: setEnvironment
};