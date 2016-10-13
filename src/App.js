import React, { Component } from 'react';
import './App.css';

// NOTE: Output from selector which has parsed this result. All
//       grouping logic, etc is expected to have already to derived.
//       Records that are designed to be processed as semantic records
//       will have their full message payload as part of the model, so
//       the targeted template has as much data as it needs to produce
//       an out - it will most likely have its own selector processing
//       the raw payload.
const data = [
  {
    types: ['express-action-begin', 'express-action', 'action-begin', 'action'],
    payload: {
      ordinal: 1,
      title: 'Action Middleware Start',
      offset: 0.01
    }
  },
  {
    types: ['logging'],
    payload: {
      ordinal: 2,
      category: '[info]',
      message: 'This is the first message',
      offset: 0.12
    }
  },
  {
    types: ['logging'],
    payload: {
      ordinal: 3,
      category: '[info]',
      message: 'This is the second message',
      offset: 0.43
    }
  },
  {
    types: ['logging-group-start', 'logging'],
    payload: {
      ordinal: 4,
      message: 'Logic Processing',
      duration: 10.12,
      offset: 0.98
    }
  },
  {
    types: ['raven-data-access', 'data-access'],
    payload: {
      ordinal: 5,
      duration: 99.99,
      query: 'Select * From Person',
      bird: 'raven',
      offset: 1.34
    }
  },
  {
    types: ['logging'],
    payload: {
      ordinal: 6,
      category: '[info]',
      message: 'This is the third message',
      offset: 1.98
    }
  },
  {
    types: ['logging-group-end', 'logging'],
    payload: {
      ordinal: 7,
      message: 'Logic Processing',
      offset: 2.65
    }
  },
  {
    types: ['logging'],
    payload: {
      ordinal: 8,
      category: '[info]',
      message: 'This is the forth message',
      offset: 3.52
    }
  },
  {
    types: ['express-action-end', 'express-action', 'action-end', 'action'],
    payload: {
      ordinal: 9,
      duration: 12.23,
      title: 'Action Middleware End',
      offset: 6.09
    }
  },
];


// NOTE: core processor that figures out how to treat the available
//       templates (target vs generic) based on the current records
//       types.
const templateProcessor = (function() {
  function templateFinder(types, templates) {
    for (let i = 0; i < types.length; i++) {
      const template = templates[types[i]];
      if (template) {
        return template;
      }
    }
  }

  return function(records, primaryTemplates, layoutTemplates) {
    return records.map((record, i) => {
      let template = templateFinder(record.types, primaryTemplates);
      if (template) {
        return template(record, i);
      }

      if (layoutTemplates && layoutTemplates.templates && layoutTemplates.layout) {
        let template = templateFinder(record.types, layoutTemplates.templates);
        if (template) {
          return layoutTemplates.layout(record, i, template, records);
        }
      }

      return undefined;
    });
  }
})();


class LoggingTable extends Component {
  render() {
    return (
      <div className="App">
        <table>
          <thead>
            <tr>
              <th>Ordinal</th>
              <th>Category</th>
              <th>Message</th>
              <th>Offset</th>
            </tr>
          </thead>
          <tbody>
            {templateProcessor(data, LoggingTable.templates, LoggingTable.layoutTemplates)}
          </tbody>
        </table>
      </div>
    );
  }
}


// NOTE: structure is not fixed but makes sense to have something for the
//       moment whilst we are poking holes.
LoggingTable.layoutTemplates = {
  layout: function(record, index, template, records) {
    return (
      <tr key={index}>
        <td>{record.payload.ordinal}</td>
        <td colSpan="2">{template(record, index, records)}</td>
        <td>{record.payload.offset}</td>
      </tr>
    );
  },
  templates: {
    'data-access': function(record, index, records) {
      return (
        <span>{record.payload.query} ({record.payload.duration}ms)</span>
      )
    },
    'action': function(record, index, records) {
      return (
        <span>{record.payload.title}</span>
      )
    }
  }
};

LoggingTable.templates = {
  'logging-group-start': function(record, index) {
    return (
      <tr key={index} className="startGroup">
        <td>{record.payload.ordinal}</td>
        <td></td>
        <td>START - {record.payload.message} <span className="groupDuration">({record.payload.duration}ms)</span></td>
        <td>{record.payload.offset}</td>
      </tr>
    );
  },
  'logging-group-end': function(record, index) {
    return (
      <tr key={index} className="endGroup">
        <td>{record.payload.ordinal}</td>
        <td></td>
        <td>END - {record.payload.message}</td>
        <td>{record.payload.offset}</td>
      </tr>
    );
  },
  'logging': function(record, index) {
    return (
      <tr key={index}>
        <td>{record.payload.ordinal}</td>
        <td>{record.payload.category}</td>
        <td>{record.payload.message}</td>
        <td>{record.payload.offset}</td>
      </tr>
    );
  }
};

export default LoggingTable;
