/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], (search, record) => {
  const afterSubmit = (context) => {
    try {
      log.debug('context', context);
      log.debug('context type', context.type);

      if (context.type == 'create' || context.type == 'edit') { // change to create only
        const SORec = context.newRecord;
        const status = SORec.getValue({
          fieldId: 'status'
        });
        log.debug('status:::', status);
        if (status != 'Pending Billing') { return; }

        const customerType = SORec.getValue({
          fieldId: 'custbody1'
        }) || '';
        log.debug('customerType:::', customerType);
        log.debug('customerType:::', customerType.indexOf('PANTRY'));

        if (customerType.indexOf('PANTRY') == -1) { return; }

        // if (customerType != 'DELCO PANTRY') { return; }

        const lines = SORec.getLineCount({
          sublistId: 'item'
        });
        log.debug('lines:::', lines);
        const SO = record.load({
          type: 'salesorder',
          id: SORec.id
        });

        for (let i = 0; i < lines; i += 1) {
          SO.setSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            line: i,
            value: 0
          });
          SO.setSublistValue({
            sublistId: 'item',
            fieldId: 'isclosed',
            line: i,
            value: true
          });
        }

        SO.save();
      }
    } catch (e) {
      log.error('Rendering error', e);
      throw e;
    }
  };

  return {
    afterSubmit
  };
});
