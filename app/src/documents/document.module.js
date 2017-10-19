angular
    .module('openDeskApp.documents', ['ngMaterial', 'pascalprecht.translate'])
    .constant('EDITOR_CONFIG', {
        lool : {
            mimeTypes: [
                "application/vnd.lotus-wordpro",
                "image/svg+xml",
                "application/vnd.ms-powerpoint",
                "application/vnd.ms-excel",
                "application/vnd.sun.xml.writer",
                "application/vnd.oasis.opendocument.text",
                "application/vnd.oasis.opendocument.text-flat-xml",
                "application/vnd.sun.xml.calc",
                "application/vnd.oasis.opendocument.spreadsheet",
                "application/vnd.oasis.opendocument.spreadsheet-flat-xml",
                "application/vnd.sun.xml.impress",
                "application/vnd.oasis.opendocument.presentation",
                "application/vnd.oasis.opendocument.presentation-flat-xml",
                "application/vnd.sun.xml.draw",
                "application/vnd.oasis.opendocument.graphics",
                "application/vnd.oasis.opendocument.graphics-flat-xml",
                "application/vnd.oasis.opendocument.chart",
                "application/vnd.sun.xml.writer.global",
                "application/vnd.oasis.opendocument.text-master",
                "application/vnd.sun.xml.writer.template",
                "application/vnd.oasis.opendocument.text-template",
                "application/vnd.oasis.opendocument.text-master-template",
                "application/vnd.sun.xml.calc.template",
                "application/vnd.oasis.opendocument.spreadsheet-template",
                "application/vnd.sun.xml.impress.template",
                "application/vnd.oasis.opendocument.presentation-template",
                "application/vnd.sun.xml.draw.template",
                "application/vnd.oasis.opendocument.graphics-template",
                "application/vnd.oasis.opendocument.database",
                "application/vnd.openofficeorg.extension",
                "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-word.document.macroEnabled.12",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
                "application/vnd.ms-word.template.macroEnabled.12",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
                "application/vnd.ms-excel.template.macroEnabled.12",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
                "application/vnd.ms-excel.sheet.macroEnabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.template",
                "application/vnd.ms-powerpoint.template.macroEnabled.12",
                "application/vnd.wordperfect",
                "application/x-aportisdoc",
                "application/x-hwp",
                "application/vnd.ms-works",
                "application/x-mswrite",
                "application/x-dif-document",
                "text/spreadsheet",
                "text/csv",
                "application/x-dbase",
                "application/vnd.lotus-1-2-3",
                "image/cgm",
                "image/vnd.dxf",
                "image/x-emf",
                "image/x-wmf",
                "application/coreldraw",
                "application/vnd.visio2013",
                "application/vnd.visio",
                "application/x-mspublisher",
                "application/x-sony-bbeb",
                "application/x-gnumeric",
                "application/macwriteii",
                "application/x-iwork-numbers-sffnumbers",
                "application/vnd.oasis.opendocument.text-web",
                "application/x-pagemaker",
                "application/rtf",
                "application/x-fictionbook+xml",
                "application/clarisworks",
                "application/vnd.corel-draw",
                "image/x-wpg",
                "application/prs.plucker",
                "application/x-iwork-pages-sffpages",
                "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                "application/x-iwork-keynote-sffkey",
                "application/x-abiword",
                "image/x-freehand",
                "application/vnd.palm",
                "application/vnd.sun.xml.chart",
                "application/vnd.sun.xml.writer.web",
                "application/x-t602",
                "application/vnd.sun.xml.report.chart"
            ]
        },
        msOffice: {
            mimeTypes: [
                "application/msword",
                "application/vnd.ms-word",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-word.document.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
                "application/vnd.ms-word.template.macroenabled.12",
                "application/msexcel",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
                "application/vnd.ms-excel.sheet.macroenabled.12",
                "application/vnd.ms-excel.template.macroenabled.12",
                "application/vnd.ms-excel.addin.macroenabled.12",
                "application/vnd.ms-excel.sheet.binary.macroenabled.12",
                "application/mspowerpoint",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.ms-powerpoint.presentation.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.template",
                "application/vnd.ms-powerpoint.template.macroenabled.12",
                "application/vnd.ms-powerpoint.addin.macroenabled.12",
                "application/vnd.openxmlformats-officedocument.presentationml.slide",
                "application/vnd.ms-powerpoint.slide.macroEnabled.12",
                "application/vnd.visio",
                "application/vnd.visio2013",
                "application/vnd.ms-project"
            ]
        }
    })
    .config(config);

function config($stateProvider, USER_ROLES) {

    $stateProvider.state('document', {
        parent: 'site',
        url: '/dokument/:doc',
        views: {
            'content@': {
                templateUrl: 'app/src/documents/view/document.html',
                controller: 'DocumentController',
                controllerAs: 'vm'
            }
        },
        params: {
            nodiref: null,
            authorizedRoles: [USER_ROLES.user]
        }
    });

}