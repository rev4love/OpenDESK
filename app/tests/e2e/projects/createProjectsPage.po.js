var globalHeaderMenu = require('../common/globalHeader.po.js');
var projectName = '';
var projectList = [];

var CreateProjectPage = function () {

    var public = {};

    public.getProjectList = function () {
        //projectList = element.all(by.repeater('project in vm.sites'));
        element.all(by.repeater('project in vm.showall')).map(function (elm) {
            return elm.element(by.css("a.od-filebrowser-link")).getAttribute("href");
        }).then(function (links) {
            for (var i = 0; i < links.length; i++) {
                console.log(links[i]);
                projectList.push(links[i]);
            }

            return projectList;
        });
    }

    public.getCreatedProject = function () {
        return projectName;
    }

    public.getProjectPageTitle = function() {
        return element(by.css('h1.od-title'));
    }

    public.getCreatedProjectUrl = function () {
        return 'http://localhost:8000/#!/projekter/'+projectName+'/dokumenter';
    }

    public.openCreateProjectDialog = function() {
        element(by.css('[ng-click="pdc.openPdSiteCreateDialog($event)"]')).click();
    }

    public.fillInputFields = function (name, isPrivate) {
        projectName = name;
        var private = isPrivate ? 'privat' : 'offentlig';

        var createProjectDialog = element(by.css('.pd-site-create-form'));

        var templateInput = element(by.model('newSite.template.name'));
        var firstTemplate = element(by.css('[value="no-template"]'));
        var projectNameInput = element(by.model('newSite.siteName'));

        var projectOwnerInput = createProjectDialog.element(by.model(['$mdAutocompleteCtrl.scope.searchText']));
        var firstProjectOwner = element(by.css('.md-autocomplete-suggestions li'));

        var descriptionInput = element(by.model('newSite.desc'));
        var centerInput = element(by.model('newSite.center_id'));
        var firstCenter = element(by.css('.md-active md-option'));
        var sbsysInput = element(by.model('newSite.sbsys'));
        var privateInput = element(by.model('newSite.isPrivate'));

        templateInput.click();
        firstTemplate.click();
        projectNameInput.sendKeys(name);

        projectOwnerInput.sendKeys("a");
        firstProjectOwner.click();

        descriptionInput.sendKeys("Jeg er en beskrivelse");

        centerInput.click();
        firstCenter.click();

        sbsysInput.sendKeys("123456");

        if (isPrivate) {
            privateInput.click();
        }
    }

    public.createProject = function() {
        element(by.css('[aria-label="Opret projekt"]')).click();
    };


    return public;
};

module.exports = CreateProjectPage();