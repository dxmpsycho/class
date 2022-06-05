/* функция для прохода по файлам указанного типа */

module.exports = (type) => {
    const fs        = require('fs');
    const path      = require('path');
    const paths = []
    let dirname = __dirname.replace("static",'app')
    fs
        .readdirSync(dirname)
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file.slice(-3) !== '.js');
        })
        .forEach(folder => {
            fs.readdirSync(path.join(dirname, folder)).forEach(file => {
                file = file.split('.').splice(1)
                // если существует указанный тип, то подключаем его
                if (file.includes(type))
                    paths.push(require(path.join(dirname,`/${folder}/${folder}.${type}`)))
            })
        });
    return paths
}