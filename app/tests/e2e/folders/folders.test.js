var constants = require('../common/constants');
var projectHelper = require('../projects/projectHelper.js');
var documentHelper = require('../documents/documentHelper.js');
var createFolderPage = require('./createFolderPage.po.js');
var renameFolderPage = require('./renameFolderPage.po.js');
var deleteFolderPage = require('./deleteFolderPage.po.js');

describe('OpenDesk folders', function () {

    it('should go to the default project', function () {
        projectHelper.openDefaultProject();
    });

    it('create a new folder', function () {
        createFolderPage.openCreateFolderDialog();
        createFolderPage.fillInputFields(constants.FOLDER);
        createFolderPage.createFolder();

        documentHelper.findDocumentInList(constants.FOLDER).then(function (response) {
            expect(response.length).toBe(1);
        });
    });

    it('should rename the folder', function() {
        renameFolderPage.renameFolder(constants.FOLDER,constants.FOLDER_RENAME);

        documentHelper.findDocumentInList(constants.FOLDER_RENAME).then(function (response) {
            expect(response.length).toBe(1);
        });
    });

    it('should delete folder', function () {
        deleteFolderPage.deleteFolder(constants.FOLDER_RENAME);

        documentHelper.findDocumentInList(constants.FOLDER_RENAME).then(function (response) {
            expect(response.length).toBe(0);
        });
    });

    it('should go back to project list', function () {
        projectHelper.backToProjects();
    });

});