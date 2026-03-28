const auth = (req, res, next) => {
    //NOTE: this is the authentication middleware which will check
    //whether the token is valid or not and then if valid will attach to the req.user = decoded
    const token = req.headers.authorization.split("").[1];

};

