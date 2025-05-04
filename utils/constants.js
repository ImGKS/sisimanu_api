const ALLOWED_UPDATE_FIELDS = ["firstName", "lastName", "profilePic", "age", "gender", "about", "isPremium" ]

const ALLOWED_REQUEST_STATUS = ["interested", "ignored"]
const ALLOWED_ACTION_REQUEST_STATUS = ["accepted", "rejected"]

const USER_SAFE_DATA = ["firstName", "lastName", "profilePic", "age", "gender", "about", "isPremium"]

const PREMIUM_PLAN = [
    {
        plan_id: 'price_1RKlCySE6xCdwqaZIif9IlqY',
        plan_name: 'monthly',
        duration: 'month'
    },
    {
        plan_id: 'price_1RKm3JSE6xCdwqaZlqosV7G6',
        plan_name: 'yearly',
        duration: 'year'
    }

]

// const STRIPE_KEY = 'sk_test_51O0H4mSE6xCdwqaZmG1vsrGYbwEAjUCJSXGCqqF1Zn7yYHgx9L3W0cUgzZIDVpErOsb3xgz5LqgApGopcqaoDPbN00FPtoLswy'

module.exports = {
    ALLOWED_UPDATE_FIELDS,
    ALLOWED_REQUEST_STATUS,
    USER_SAFE_DATA,
    ALLOWED_ACTION_REQUEST_STATUS,
    PREMIUM_PLAN,
    // STRIPE_KEY
}