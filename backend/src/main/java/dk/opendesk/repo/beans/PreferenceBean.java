package dk.opendesk.repo.beans;

import org.alfresco.service.cmr.preference.PreferenceService;

import java.io.Serializable;
import java.util.Map;

public class PreferenceBean {

    private PreferenceService preferenceService;

    public void setPreferenceService(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    /**
     * Gets the filtered preferences of a user.
     * @param userName of the user.
     * @param filter that is used to find a set of preferences. Leave empty to get all preferences.
     * @return a map of preferences.
     */
    public Map<String, Serializable> getPreferences(String userName, String filter) {
        return preferenceService.getPreferences(userName, filter);
    }
}
