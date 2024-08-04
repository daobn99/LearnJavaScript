function Validator(formSelector) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    const formRules = {};

    /**
     * Quy ước tạo rules:
     * - Nếu có lỗi thì return `error message`
     * - Nếu không có lỗi thì return `undefine`
     */
    const validatorRules = {
        required: function (value) {   //required: bắt buộc (必須)
            return value ? undefined : "入力必須な項目です"         //ternary operator
        },
        email: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "メールアドレスの形式で入力してください"
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `半角数字${min}文字以上で入力してください`
            }
        }
    };

    let formElement = document.querySelector(formSelector);
    //chỉ xử lý khi có element trong DOM
    if (formElement) {
        let inputs = formElement.querySelectorAll("[name][rules]");  //var không có tính chất khối nên là một biến global
        for (let input of inputs) {
            let rules = input.getAttribute("rules").split("|");   //rules này là biến tự tạo, không phải rules attribute của thẻ input html. split() cắt một string thành một array, nên rules này là 1 array
            for (let rule of rules) {
                let passwordRule;
                let isRuleHasValue = rule.includes(":");

                if (isRuleHasValue) {
                    passwordRule = rule.split(":");  //output: ['min', '6']
                    rule = passwordRule[0];
                }

                let ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(passwordRule[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }
            //Lắng nghe sự kiện để validate (blur, change,..)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }
        //Hàm thực hiện validate
        function handleValidate(event) {
            let rules = formRules[event.target.name];
            let errorMessage;

            rules.find(function (rule) {
                errorMessage = rule(event.target.value);
                return errorMessage;
            });

            //Nếu có lỗi thì hiển thị meassage lỗi ra UI
            if (errorMessage) {
                let formGroup = getParent(event.target, ".form-group");
                if (formGroup) {
                    formGroup.classList.add("invalid");
                    let formMessage = formGroup.querySelector(".form-message");
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
        }
        function handleClearError(event) {
            let formGroup = getParent(event.target, ".form-group");
            if (formGroup.classList.contains("invalid")) {
                formGroup.classList.remove("invalid");

                let formMessage = formGroup.querySelector(".form-message");
                if (formMessage) {
                    formMessage.innerText = "";
                }

            }
        }
    }
}
