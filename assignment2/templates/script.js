function resetForm() {
    // 获取表单元素
    var streetInput = document.getElementById('street');
    var cityInput = document.getElementById('city');
    var stateSelect = document.getElementById('state');
    var checkbox = document.getElementById('autoDetect');

    // 重置表单字段
    streetInput.value = '';
    cityInput.value = '';
    stateSelect.value = '';  // 确保这里设置为默认或空选项的值

    // 重置复选框
    checkbox.checked = false;

    // 重新启用所有字段，如果之前有禁用
    streetInput.disabled = false;
    cityInput.disabled = false;
    stateSelect.disabled = false;
}

document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.getElementById('autoDetect');
    var streetInput = document.getElementById('street');
    var cityInput = document.getElementById('city');
    var stateSelect = document.getElementById('state');

    // 监听复选框的变化
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            fetchLocationAndDisableFields();
        } else {
            enableFields();
        }
    });

    function fetchLocationAndDisableFields() {
        // 使用您提供的 token
        fetch('https://ipinfo.io?token=b7d947caec3ca6')
            .then(response => response.json())
            .then(data => {
                // 假设 data.loc 包含纬度和经度，data.city 和 data.region 包含城市和州
                streetInput.value = ''; // 清空街道信息
                cityInput.value = data.city;
                stateSelect.value = data.region;
                disableFields(); // 禁用字段
            })
            .catch(error => {
                console.error('Error fetching location:', error);
                enableFields(); // 如果 API 调用失败，重新启用字段
            });
    }

    function disableFields() {
        streetInput.disabled = true;
        cityInput.disabled = true;
        stateSelect.disabled = true;
    }

    function enableFields() {
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateSelect.disabled = false;

        // Optionally clear values when disabling autodetect
        streetInput.value = '';
        cityInput.value = '';
        stateSelect.value = '';
    }
});
