package dk.opendesk.webscripts.notification;

import dk.opendesk.repo.beans.NotificationBean;
import dk.opendesk.webscripts.OpenDeskWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;


public class GetNotifications extends OpenDeskWebScript {

    private NotificationBean notificationBean;

    public void setNotificationBean(NotificationBean notificationBean) {
        this.notificationBean = notificationBean;
    }

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        super.execute(req, res);
        try {
            objectResult = notificationBean.getNotifications();
        } catch (Exception e) {
            error(res, e);
        }
        write(res);
    }
}