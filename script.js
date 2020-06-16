function Validator(options) {

    const selectorRules = {};
    // Hàm thực hiện Validate
    function validate(inputElement, rule) {
        var errorMessage;
        const errorElement = inputElement.parentElement.querySelector(options.errorSelector);

        // Lấy ra các rules của Selector
        const rules = selectorRules[rule.selector];
        for(let element = 0; element < rules.length; ++element){
            errorMessage = rules[element](inputElement.value);
            if(errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        return !errorMessage;
    }

    const formElement = document.querySelector(options.form);
    if (formElement) {
        // Khi submit Form sẽ check xem cái field được điền đủ thông tin hay chưa?
        formElement.onsubmit = function(e) {
            e.preventDefault();

            let isFormValid = true;

            options.rules.forEach((rule) => {
                const inputElement = formElement.querySelector(rule.selector);
                let isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            })

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    const enableInputs = formElement.querySelectorAll('[name]');
                    const formValues = Array.from(enableInputs).reduce((values, input) => {
                        return (values[input.name] = input.value) && values;
                    },{})
                    options.onSubmit(formValues);
                }
            }else {
                console.log('Có lỗi xảy ra')
            }
        }

        options.rules.forEach((rule) => {

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            // lấy ra các input trong Form
            const inputElement = formElement.querySelector(rule.selector);
            
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                inputElement.oninput = function() {
                    const errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        })
    }
}

/* 
    - Định nghĩa Rules
    - Nguyên tắc của các Rules:
        - Khi có lỗi => return message error
        - Khi hợp lệ => return undefined
    - Tùy theo Form sẽ có các field khác nhau và có các nguyên tắc Rules khác nhau. Sau này, chỉ cần thêm rule vào là Okay :))
*/

Validator.isRequired = function (selector, message) {
    return {
        selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập lại trường này'
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập lại Email'
        }
    }
}

Validator.minLength = function (selector, min) {
    return {
        selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}