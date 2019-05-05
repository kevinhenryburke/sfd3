({

    prepareEvent : function (topic, parameters, controllerId) {
        var eventType = bzutils.getEventTypeByTopic(topic);
        return {
            "eventType" : eventType ,
            "topic" : topic,
            "parameters" : parameters,
            "controllerId" : controllerId
        }
    },


})
