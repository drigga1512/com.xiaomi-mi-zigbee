// SDK3 updated & validated : DONE

'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { debug, Cluster, CLUSTER } = require('zigbee-clusters');

const XiaomiBasicCluster = require('../../lib/XiaomiBasicCluster');

Cluster.addCluster(XiaomiBasicCluster);

let lastKey = null;

class AqaraRemoteb186acn01 extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // Enables debug logging in zigbee-clusters
    // debug(true);

    // add battery capabilities if needed
    if (!this.hasCapability('measure_battery')) {
      this.addCapability('measure_battery');
    }
    if (!this.hasCapability('alarm_battery')) {
      this.addCapability('alarm_battery');
    }

    // supported scenes and their reported attribute numbers (all based on reported data)
    this.sceneMap = {
      1: 'Key Pressed 1 time',
      2: 'Key Pressed 2 times',
      0: 'Key Held Down',
    };

    zclNode.endpoints[1].clusters[CLUSTER.MULTI_STATE_INPUT.NAME]
      .on('attr.presentValue', this.onPresentValueAttributeReport.bind(this));

    zclNode.endpoints[1].clusters[XiaomiBasicCluster.NAME]
      .on('attr.xiaomiLifeline', this.onXiaomiLifelineAttributeReport.bind(this));

    // define and register FlowCardTriggers
    this.onSceneAutocomplete = this.onSceneAutocomplete.bind(this);
  }

  onPresentValueAttributeReport(repScene) {
    this.log('MultistateInputCluster - presentValue', repScene, this.sceneMap[repScene], 'lastKey', lastKey);

    if (lastKey !== repScene) {
      lastKey = repScene;
      if (Object.keys(this.sceneMap).includes(repScene.toString())) {
        const remoteValue = {
          scene: this.sceneMap[repScene],
        };
        this.debug('Scene and Button triggers', remoteValue);
        // Trigger the trigger card with 1 dropdown option
        this.triggerFlow({
          id: 'trigger_button1_scene',
          tokens: null,
          state: remoteValue,
        })
          .catch(err => this.error('Error triggering button1SceneTriggerDevice', err));

        // Trigger the trigger card with tokens
        this.triggerFlow({
          id: 'button1_button',
          tokens: remoteValue,
          state: null,
        })
          .catch(err => this.error('Error triggering button1ButtonTriggerDevice', err));

        // reset lastKey after the last trigger
        this.buttonLastKeyTimeout = setTimeout(() => {
          lastKey = null;
        }, 3000);
      }
    }
  }

  onSceneAutocomplete(query, args, callback) {
    let resultArray = [];
    for (const sceneID in this.sceneMap) {
      resultArray.push({
        id: this.sceneMap[sceneID],
        name: this.homey.__(this.sceneMap[sceneID]),
      });
    }
    // filter for query
    resultArray = resultArray.filter(result => {
      return result.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });
    this.debug(resultArray);
    return Promise.resolve(resultArray);
  }

  /**
   * This is Xiaomi's custom lifeline attribute, it contains a lot of data, af which the most
   * interesting the battery level. The battery level divided by 1000 represents the battery
   * voltage. If the battery voltage drops below 2600 (2.6V) we assume it is almost empty, based
   * on the battery voltage curve of a CR1632.
   * @param {{batteryLevel: number}} lifeline
   */
  onXiaomiLifelineAttributeReport({
    batteryVoltage,
  } = {}) {
    this.log('lifeline attribute report', {
      batteryVoltage,
    });

    if (typeof batteryVoltage === 'number') {
      const parsedVolts = batteryVoltage / 1000;
      const minVolts = 2.5;
      const maxVolts = 3.0;
      const parsedBatPct = Math.min(100, Math.round((parsedVolts - minVolts) / (maxVolts - minVolts) * 100));
      this.setCapabilityValue('measure_battery', parsedBatPct);
      this.setCapabilityValue('alarm_battery', batteryVoltage < 2600).catch(this.error);
    }
  }

}
module.exports = AqaraRemoteb186acn01;

// WXKG11LM_ remote.b1acn01
/*
Node overview:
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ZigBeeDevice has been inited
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ------------------------------------------
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] Node: 23afeffe-6404-4f34-9cb8-a001fc4149d6
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] - Battery: false
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] - Endpoints: 0
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] -- Clusters:
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- zapp
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genBasic
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- 65520 : �A�

2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genBasic
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genIdentify
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genIdentify
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genGroups
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genGroups
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genScenes
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genScenes
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genMultistateInput
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genMultistateInput
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- presentValue : 2
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genOta
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genOta
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- manuSpecificCluster
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : manuSpecificCluster
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] - Endpoints: 1
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] -- Clusters:
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- zapp
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genIdentify
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genIdentify
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genGroups
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genGroups
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genScenes
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genScenes
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genMultistateInput
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genMultistateInput
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] - Endpoints: 2
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] -- Clusters:
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- zapp
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genIdentify
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genIdentify
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genGroups
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genGroups
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genScenes
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genScenes
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] --- genAnalogInput
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- cid : genAnalogInput
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ---- sid : attrs
2018-10-13 21:59:09 [log] [ManagerDrivers] [remote.b186acn01] [0] ------------------------------------------

*/
