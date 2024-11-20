

export const constructorMethod = (app) => {

    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};


