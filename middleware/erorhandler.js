const errorhandler=(err,req,res,next)=>{
    const statusCode=err.statusCode||500
    const message=err||'internal server error'
    console.log(message)
    const status=err.status||'error'
    return res.status(statusCode).json({
        status,
        message,
        statusCode
    })
}
module.exports=errorhandler