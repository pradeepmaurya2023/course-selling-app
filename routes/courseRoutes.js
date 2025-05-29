const {Router} = require('express');

const courseRouter = Router();

courseRouter.get('/',(req,res)=>{
    res.json({
        message : "Gettting all the courses"
    })
})

courseRouter.get('/:id',(req,res)=>{
    const id = req.params.id;
    res.json({
        message : `Course detaild of ${id}`
    })
})

module.exports = courseRouter;