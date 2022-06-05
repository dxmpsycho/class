exports.splitting = (param) => {
    try {
        const arr = param.split(',')
        arr.sort()
        return arr
    }catch(e){
        return param
    }
}