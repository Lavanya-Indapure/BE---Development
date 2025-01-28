//* try-catch block
// export const asyncHandler = (fun) => async (err,req,res,next) => {
//    try{
//     await fun(err,req,res,next)
//    }catch(error){
//     res.status(err.code || 500).json({
//         success : false,
//         message : err.message
//     })
//    }
// }

//* promise
export const asyncHandler = (fun) => {
    (req, res, next) => {
        Promise.resolve(fun(req, res, next)).catch((err) => next(err))
    }
}