export default function VariablesAndConstants() {
    var functionScoped = 2;
    let blockScoped = 5;
    const constant1 = functionScoped - blockScoped;
    let numberVariable = 123;
    let floatingPointNumber = 234.345;
    let stringVariable = 'Hello World!';
    let booleanVariable = true;
    let isNumber = typeof numberVariable;
    let isString = typeof stringVariable;
    let isBoolean = typeof booleanVariable;
    return(
        <div>
            <div id="wd-variables-and-constants">
                <h4>Variables and Constants</h4>
                functionScoped = { functionScoped }<br/>
                blockScoped = { blockScoped }<br/>
                constant1 = { constant1 }<hr/>
            </div>
            <div id="wd-variable-types">
                <h4>Variables Types</h4>
                numberVariable = { numberVariable }<br/>
                floatingPointNumber = { floatingPointNumber }<br/>
                stringVariable = { stringVariable }<br/>
                booleanVariable = { booleanVariable + "" }<br/>
                isNumber = { isNumber }<br/>
                isString = { isString }<br/>
                isBoolean = { isBoolean }<hr/>
            </div>
        </div>
    );
}