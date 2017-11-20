tinymce.init({
    selector: 'textarea.tinymce',
    theme: 'modern',
    skin: 'custom',
    height: '500px',
    plugins: ["advlist autolink link image lists charmap print preview hr anchor pagebreak",
    "searchreplace visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
    "save table contextmenu directionality template paste textcolor"],
    toolbar: 'undo redo | fontselect fontsizeselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | forecolor backcolor print',
    menubar: '',
    branding: false,
    elementpath: false,
    custom_ui_selector: '.summary-section',
    force_br_newlines: true,
    force_p_newlines: false,
    forced_root_block: ''
});