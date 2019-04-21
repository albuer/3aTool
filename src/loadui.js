var fs = require("fs");
var parameter;

function doSaveFile(saveFile) {
    var form = document.getElementById('myform');
    var value;
    for (var i = 0; i < form.length; i++) {
        var element = form[i];
        if (element.type == "text") {
            value = Number(element.value);
            if (element.unit != undefined && element.unit>0)
                value *= Number(element.unit);
            //alert('text offset: '+element.offset+', value: '+element.value+', unit: '+element.unit+', ret: '+value);
        } else if (element.type == "select-one") {
            value = Number(element.options[element.selectedIndex].text);
            //alert('select offset: '+element.offset+', value: '+value);
        } else if (element.type == "checkbox") {
            value = Number(element.checked);
            //alert('check offset: '+element.offset+', value: '+value);
        }　else {
            continue;
        }
        parameter[element.offset+1] = value>>8;
        parameter[element.offset] = value&0xFF;
    }
    fs.writeFileSync(saveFile, parameter);
    alert('保存参数成功:\n'+saveFile);
}

function loadUI(dname, filename) {
    
    if ("undefined" != typeof filename && filename != null && filename != "") {
        parameter = fs.readFileSync(filename);
    }
    alert('0');
    var data = fs.readFileSync('src/ui.json', 'utf8');
    alert('1');
    var jsonData = JSON.parse(data);
    // alert("DATA: " + JSON.stringify(jsonData));
    var div = document.getElementById(dname);
    div.innerHTML = "";
    AnalyJson(jsonData, div);
}

//创建JSON解析函数
function AnalyJson(data, div) {
    for (var p in data) {
        if (data[p].type == 'category') {
            var fd = document.createElement("fieldset");
            var ld = document.createElement("legend");
            ld.innerHTML = data[p].title;
            fd.appendChild(ld);
            AnalyJson(data[p].values, fd);
            div.appendChild(fd);
        } else {
            CreateInputViewer(data[p], div);
        }
    }
}

//针对不同的解析情况，调用下边函数
function CreateInputViewer(data, div) {
    //alert(data.type);
    switch (data.type) {
        case 'text': {
            CreateInput(data, div);
            break;
        }
        case 'select': {
            CreateSelect(data, div);
            break;
        }
        case 'checkbox': {
            CreateCheckBox(data, div);
            break;
        }
    }
}

function AddComponent(data, component, div) {
    component.title = '第' + data.offset/2 + '号参数:\n'
    if (data.detail != null)
        component.title += '    ' + data.detail;

    var ul = document.createElement("ul");
    var label_var = document.createElement("label");
    label_var.innerHTML = data.title + ": ";
    ul.appendChild(label_var);
    ul.appendChild(component);
    div.appendChild(ul);
}

function CreateInput(data, div) {
    var input = document.createElement("input");
    if (data.offset >= 0 && parameter != null) {
        input.offset = data.offset;
        var value = (parameter[data.offset + 1] << 8) + parameter[data.offset];
        if (parameter[data.offset + 1] & 0x80 && data.unit < 32768) {
            value = ((parameter[data.offset + 1] & 0x7F) << 8) + parameter[data.offset];
            value = ((~(value - 1)) & 0x7FFF) * (-1);
        }
        if (data.unit > 0) {
            //alert("value: "+value+", unit: "+data.unit);
            value = value / data.unit;
            value = value.toFixed(1);
            input.unit = data.unit;
        }
        input.value = Number(value);
    } else {
        input.disabled = true;
    }
    AddComponent(data, input, div);
}

function CreateSelect(data, div) {
    var select = document.createElement("select");

    var selectValue;
    if (data.offset >= 0 && parameter != null) {
        select.offset = data.offset;
        selectValue = (parameter[data.offset + 1] << 8) + parameter[data.offset];
    } else {
        select.disabled = true;
    }

    for (var option in data.values) {
        select.options.add(new Option(data.values[option], ""));
        if (selectValue == data.values[option])
            select.selectedIndex = option;
    }
    AddComponent(data, select, div);
}

function CreateCheckBox(data, div) {
    var checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("style", "zoom:120%;");

    if (data.offset >= 0 && parameter != null) {
        checkBox.offset = data.offset;
        var value = (parameter[data.offset + 1] << 8) + parameter[data.offset];
        if (value > 0)
            checkBox.checked = true;
        else
            checkBox.checked = false;
    } else {
        checkBox.disabled = true;
    }
    AddComponent(data, checkBox, div);
}
