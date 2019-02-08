import ReactTable from 'react-table';
import checkboxHOC from "react-table/lib/hoc/selectTable";
import {render} from 'react-dom';
import React, { Component } from 'react';
import Subtable from './Subtable';
import ProjectModal from './StationModal';
import EditStationModal from './EditStationModal';
import axios from 'axios';
import 'react-table/react-table.css'; //test

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const CheckboxTable = checkboxHOC(ReactTable);

class Csv {
  parseLine(text) {
    const regex =
    /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    let arr = [];
    text.replace(regex, (m0, m1, m2, m3) => {
      if (m1 !== undefined) {
        arr.push(m1.replace(/\\'/g, "'"));
      } else if (m2 !== undefined) {
        arr.push(m2.replace(/\\"/g, "\""));
      } else if (m3 !== undefined) {
        arr.push(m3);
      }
      return "";
    });
    if (/,\s*$/.test(text)) {
      arr.push("");
    }
    return arr;
  }

  zipObject(props, values) {
    return props.reduce((prev, prop, i) => {
      prev[prop] = values[i];
      return prev;
    }, {});
  }

  parse(csv) {
    let [properties, ...data] = csv.split("\n").map(this.parseLine);
    return data.map((line) => this.zipObject(properties, line))
  };

  serialize(obj) {
    let fields = Object.keys(obj[0]);
    let csv = obj.map(row => fields.map((fieldName) => JSON.stringify(row[fieldName] || "")));
    return [fields, ...csv].join("\n");
  }; 
}

const csv = new Csv();

class Table extends Component {
    constructor(props) {
      super(props);
      this.state = {
        //PPs: this.props.PPs, //most likely wont set to state, just use componentDidUpdate below and if=> update!
        data: [],
        yesterdayDate: '',
        todayDate: '',
        today: new Date(),
        selection: [],
        selectAll: false,
        toEdit: {},
        modal: false,
        type: '',
        loading: this.props.loading
      };
      this.formatData = this.formatData.bind(this);
      this.getData = this.getData.bind(this);
      const today = this.state.today;
        //const yesterday = today.setDate(today.getDate() -1);
      const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
      this.todayF = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
      this.yesterdayF = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
    }
    
    // confData = (data) => {
    //   (data) ? data : 'N/A';
    // }
    // confTot = (data1, data2) => {
    //   if (data1 && data2) { return (data1 + data2)}
    //     else if (data1) { return data1 }
    //     else if (data2) { return data2 }
    //     else { return 'N/A' }
    // }

    //going to repeat code from date, need to obtain through scope to fix
    getData = (stationID) => {
      try {
        const urlBase = "https://morning-retreat-23014.herokuapp.com/https://www.wunderground.com/weatherstation/WXDailyHistory.asp?ID=";
        const today = this.state.today;
        //const yesterday = today.setDate(today.getDate() -1);
        const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
        const todayY = today.getFullYear();
        const todayM = today.getMonth()+1;
        const todayD = today.getDate();
        const yesterdayY = today.getFullYear();
        const yesterdayM = yesterday.getMonth()+1;
        const yesterdayD = yesterday.getDate();
        const url = `${urlBase}${stationID}&day=${yesterdayD}&month=${yesterdayM}&year=${yesterdayY}&dayend=${todayD}&monthend=${todayM}&yearend=${todayY}&graphspan=custom&format=1`;
        return axios({
          method:'get',
          url:url,
          headers: {
              Accept:'text/html',
              'Content-Type': 'text/plain',
              //Origin: '',
              'X-Requested-With': 'XMLHttpRequest'
              },
        })
      } catch (error) {
        console.error(error)
      }
    }
    
    formatData = async (PPs) => {
      //this.setState({ data: [] }); //if going to use this, ensure the rest of this function is the callback!
      console.log("formatData() called")
      let pulledData = [];
      //const stationID = this.state.data[0].stationID;
      PPs.map( PP => this.getData(PP.stationID) //map over array of SIDs here
        .then(response => {
          if (response.data) {
            pulledData = response.data; //turn this into a function
            pulledData = pulledData.replace(/[<]br[^>]*[>]/gi,"");
            pulledData = pulledData.replace(/^\s*\n/gm, "");
            pulledData = pulledData.trim();
            pulledData = csv.parse(pulledData);
            console.log(pulledData);
            console.log(pulledData[0].Date, this.todayF, this.yesterdayF);
            
            if (pulledData.length === 2) {
              this.setState({ // make this a function for clean code
                ...this.state,
                data: [...this.state.data,
                  {
                    _id: PP._id,
                    jobName: PP.jobName,
                    stationID: PP.stationID,
                    trigger: PP.trigger,
                    yesterdayP: pulledData[0].PrecipitationSumIn,
                    todayP: pulledData[1].PrecipitationSumIn,
                    totalP: (+pulledData[0].PrecipitationSumIn + +pulledData[1].PrecipitationSumIn).toFixed(2)
                  }],
                    todayDate: this.todayF, //will likely get taken out and passed from a date selector
                    yesterdayDate: this.yesterdayF, //will likely get taken out and passed from a date selector
                  }
              // () => this.setState({...this.state, data: [...(new Set(this.state.data))]})
              );
            } else if (pulledData.length === 1 && pulledData[0].Date === this.todayF) {
              //insert code above for today, repeat with if for yesterday below and repeat for none
              this.setState({
                ...this.state,
                data: [...this.state.data,
                  {
                    _id: PP._id,
                    jobName: PP.jobName,
                    stationID: PP.stationID,
                    trigger: PP.trigger,
                    yesterdayP: 'N/A',
                    todayP: pulledData[0].PrecipitationSumIn,
                    totalP: (+pulledData[0].PrecipitationSumIn).toFixed(2)
                  }],
                    todayDate: this.todayF, //will likely get taken out and passed from a date selector
                    yesterdayDate: this.yesterdayF, //will likely get taken out and passed from a date selector
                  }
              // () => this.setState({...this.state, data: [...(new Set(this.state.data))]})
              );
            } else if (pulledData.length === 1 && pulledData[0].Date === this.yesterdayF) {
              this.setState({
                ...this.state,
                data: [...this.state.data,
                  {
                    _id: PP._id,
                    jobName: PP.jobName,
                    stationID: PP.stationID,
                    trigger: PP.trigger,
                    yesterdayP: pulledData[0].PrecipitationSumIn,
                    todayP: 'N/A',
                    totalP: (+pulledData[0].PrecipitationSumIn).toFixed(2)
                  }],
                    todayDate: this.todayF, //will likely get taken out and passed from a date selector
                    yesterdayDate: this.yesterdayF, //will likely get taken out and passed from a date selector
                  }
              // () => this.setState({...this.state, data: [...(new Set(this.state.data))]})
              );
            } else {
              this.setState({
                ...this.state,
                data: [...this.state.data,
                  {
                    _id: PP._id,
                    jobName: PP.jobName,
                    stationID: PP.stationID,
                    trigger: PP.trigger,
                    yesterdayP: 'N/A',
                    todayP: 'N/A',
                    totalP: 'N/A'
                  }],
                    todayDate: this.todayF, //will likely get taken out and passed from a date selector
                    yesterdayDate: this.yesterdayF, //will likely get taken out and passed from a date selector
                  }
              // () => this.setState({...this.state, data: [...(new Set(this.state.data))]})
              );
            }
          }
          //add an elseif statement to catch error of not reporting.  would ===
/*
Date,TemperatureHighF,TemperatureAvgF,TemperatureLowF,DewpointHighF,DewpointAvgF,DewpointLowF,HumidityHigh,HumidityAvg,HumidityLow,PressureMaxIn,PressureMinIn,WindSpeedMaxMPH,WindSpeedAvgMPH,GustSpeedMaxMPH,PrecipitationSumIn<br>
*/
        })
        .catch(error => { console.log(error) })
      )
    }

  //   componentWillMount() {
  // }

    // componentWillReceiveProps(props) {
    //   this.setState({...this.state, PPs: [...this.state.PPs, ...props.PPs]},
    //     function() {this.formatData()});
    // }

    componentDidUpdate(prevProps, prevState) {
      if(this.props !== prevProps) {
        if (this.props.PPs === []) {this.setState({data: [], selection: []})}
        else {
          console.log("going to update with formatData()", this.props.PPs);
          this.setState({data: [], selection: []},
            () => this.formatData(this.props.PPs, () => {
              console.log("testing", this.props.PPs, this.state.data)
            }));
        }
      }
    }
    
    // componentDidMount() {
    //   this.formatData();// here is where we should map over a state based list of stations
    // }

    toggleSelection = (key, shift, row) => {
      /*
        Implementation of how to manage the selection state is up to the developer.
        This implementation uses an array stored in the component state.
        Other implementations could use object keys, a Javascript Set, or Redux... etc.
      */
      // start off with the existing state
      let selection = [...this.state.selection];
      const keyIndex = selection.indexOf(key);
      // check to see if the key exists
      if (keyIndex >= 0) {
        // it does exist so we will remove it using destructing
        selection = [
          ...selection.slice(0, keyIndex),
          ...selection.slice(keyIndex + 1)
        ];
      } else {
        // it does not exist so add it
        selection.push(key);
      }
      // update the state
      this.setState({ selection });
    };
  
    toggleAll = () => {
      /*
        'toggleAll' is a tricky concept with any filterable table
        do you just select ALL the records that are in your data?
        OR
        do you only select ALL the records that are in the current filtered data?
        
        The latter makes more sense because 'selection' is a visual thing for the user.
        This is especially true if you are going to implement a set of external functions
        that act on the selected information (you would not want to DELETE the wrong thing!).
        
        So, to that end, access to the internals of ReactTable are required to get what is
        currently visible in the table (either on the current page or any other page).
        
        The HOC provides a method call 'getWrappedInstance' to get a ref to the wrapped
        ReactTable and then get the internal state and the 'sortedData'. 
        That can then be iterrated to get all the currently visible records and set
        the selection state.
      */
      const selectAll = this.state.selectAll ? false : true;
      const selection = [];
      if (selectAll) {
        // we need to get at the internals of ReactTable
        const wrappedInstance = this.checkboxTable.getWrappedInstance();
        // the 'sortedData' property contains the currently accessible records based on the filter and sort
        const currentRecords = wrappedInstance.getResolvedState().sortedData;
        // we just push all the IDs onto the selection array
        currentRecords.forEach(item => {
          selection.push(item._original._id);
        });
      }
      this.setState({ selectAll, selection });
    };
  
    isSelected = key => {
      /*
        Instead of passing our external selection state we provide an 'isSelected'
        callback and detect the selection state ourselves. This allows any implementation
        for selection (either an array, object keys, or even a Javascript Set object).
      */
      return this.state.selection.includes(key);
    };
  
    // logSelection = () => {
    //   console.log("selection:", this.state.selection);
    // };
    
    // editSelection = () => {
    //   if (this.state.selection.length > 1) {
    //     alert("You can only edit one project at a time")
    //   } else {

    //   };
    // };

    toggle = () => {
      console.log("toggle called");
      this.setState({
          modal: !this.state.modal
      });
    }

    handleClick = (param) => (event) => {
      if (this.state.selection.length > 1) {
        switch (param) {
          case "Add":
            this.setState({modal: true, selection: [], type: param});
            break;
          case "Edit":
            alert("You can only edit one project at a time");
            break;
        }
      } else if (this.state.selection < 1) {
        switch (param) {
          case "Add":
            this.setState({modal: true, type: param});
            break;
          case "Edit":
            alert("Select a Station to edit");
            break;
        }
      } else {
        switch (param) {
          case "Add":
            this.setState({modal: true, selection: [], toEdit: {}, type: param});
            break;
          case "Edit": 
            let a = this.state.selection[0].replace(/_P$|_S$|_T$/g,'');
            const b = this.props.PPs.filter(PP => { //better off using filter here? YES :)
              return PP._id.includes(a) //regex the end off of the _id, and -5 from the degree symbol, pass to toEdit down to editModal
            });
            const p = b.find(pa => a+'_P' === pa._id);
            const s = b.find(sa => a+'_S' === sa._id);
            const t = b.find(ta => a+'_T' === ta._id);
            this.setState({
              type: param,
              toEdit: {
                _id: a,
                jobName: b[0].jobName.slice(0,-5),
                stateName: this.props.stateName,
                primary: p.stationID,
                secondary: s.stationID,
                tertiary: t.stationID,
                trigger: b[0].trigger
              },
              modal: true
            });
          };
        }
      //   let a = this.state.selection[0].replace(/_P$|_S$|_T$/g,'');
      //   const b = this.props.PPs.filter(PP => { //better off using filter here? YES :)
      //     return PP._id.includes(a) //regex the end off of the _id, and -5 from the degree symbol, pass to toEdit down to editModal
      //   });
      //   const p = b.find(pa => a+'_P' === pa._id);
      //   const s = b.find(sa => a+'_S' === sa._id);
      //   const t = b.find(ta => a+'_T' === ta._id);
      //   this.setState({
      //     type: param,
      //     toEdit: {
      //       _id: a,
      //       jobName: b[0].jobName.slice(0,-5),
      //       stateName: this.props.stateName,
      //       primary: p.stationID,
      //       secondary: s.stationID,
      //       tertiary: t.stationID
      //     },
      //     modal: true
      //   });
      // };
      event.preventDefault();
    };

    render() {
      // const stationID = stationID; //import from Table state? row/subtable state?
      const { data, today } = this.state;
      //const stationID = this.state.data[0].stationID;
      //console.log(stationID);
      const { todayDate } = this.state;
      const yesterday = new Date(new Date().setDate(new Date().getDate()-1));
      const baseURL = "https://www.wunderground.com/personal-weather-station/dashboard?ID=";
      const tailURL = `s${yesterday.getFullYear()}${("0"+yesterday.getDate()).slice(-2)}${("0"+ (yesterday.getMonth()+1)).slice(-2)}/${today.getFullYear()}${("0"+today.getDate()).slice(-2)}${("0"+ (today.getMonth()+1)).slice(-2)}/mcustom`;
      const { toggleSelection, toggleAll, isSelected } = this;
      const { selectAll } = this.state;

      const getColumnWidth = (rows, accessor, headerText) => {
        const maxWidth = 400
        const magicSpacing = 10
        const cellLength = Math.max(
          ...rows.map(row => (`${row[accessor]}` || '').length),
          headerText.length,
        )
        return Math.min(maxWidth, cellLength * magicSpacing)
      }
  
      const checkboxProps = {
        selectAll,
        isSelected,
        toggleSelection,
        toggleAll,
        selectType: "checkbox",
        getTrProps: (r) => {
          // someone asked for an example of a background color change
          // here it is...
          const selected = this.isSelected(r._id);
          return {
            style: {
              backgroundColor: selected ? "lightgreen" : "inherit"
              // color: selected ? 'white' : 'inherit',
            }
          };
        }
      };
  
      return (
        <div>
          <span>
            <EditStationModal 
              handleClick={this.handleClick.bind(this)}
              toggle={this.toggle.bind(this)}
              modal={this.state.modal}
              type={this.state.type}
              _id={this.state.toEdit._id ? this.state.toEdit._id : null}
              jobName={this.state.toEdit.jobName}
              stateName={this.state.toEdit.stateName}
              primary={this.state.toEdit.primary}
              secondary={this.state.toEdit.secondary}
              tertiary={this.state.toEdit.tertiary}
              trigger={this.state.toEdit.trigger}
            />

          </span>
            <CheckboxTable
              ref={row => (this.checkboxTable = row)}
              data={data}
              columns={[
              {
                Header: 'Job Name',
                accessor: "jobName",
                width: "175px"
              }, {
                Header: 'Station',
                accessor: "stationID",//add <a href wunderground here>
                width: getColumnWidth(data, "stationID", 'Station'),
                style: {textAlign: "center"},
                Cell: d =><a href={`${baseURL}${d.value}${tailURL}`} target="_blank"> {d.value} </a>
              }, {
                Header: this.state.yesterdayDate,
                accessor: "yesterdayP",
                width: getColumnWidth(data, "yesterdayP", this.state.yesterdayDate),
                style: {textAlign: "center"},
                //can you use...  Cell: d => if(d===undefined/null) {return yellow error triangle?}
                Cell: ( {row, original} ) => { 
                  return row.yesterdayP >= original.trigger ? <div style={{
                    height: '100%',
                    width: getColumnWidth(data, "yesterdayP", this.state.yesterdayDate),
                    textAlign: "center",
                    backgroundColor: '#FF0000'}}>{row.yesterdayP}</div> : <div>{row.yesterdayP}</div>
                  }
              }, {
                Header: this.state.todayDate,
                // id: "PrecipitationSumIn1",
                accessor: "todayP",
                width: getColumnWidth(data, "todayP", this.state.todayDate),
                style: {textAlign: "center"},
                Cell: ( {row, original} ) => { 
                  return row.todayP >= original.trigger ? <div style={{
                    height: '100%',
                    width: getColumnWidth(data, "todayP", this.state.todayDate),
                    textAlign: "center",
                    backgroundColor: '#FF0000'}}>{row.todayP}</div> : <div>{row.todayP}</div>
                  }
              }, {
                Header: 'Total Precipitation',
                // id: "PrecipitationSumIn2",
                accessor: "totalP",
                width: "59px",
                style: {textAlign: "center"},
                Cell: ( {row, original} ) => { 
                  return row.totalP >= original.trigger ? <div style={{
                    height: '100%',
                    width: getColumnWidth(data, "totalP", "Total Precipitation"),
                    textAlign: "center",
                    backgroundColor: '#FF0000'}}>{row.totalP}</div> : <div>{row.totalP}</div>
                  }
              }, {
                Header: 'Trigger',
                // id: "PrecipitationSumIn2",
                accessor: "trigger",
                width: getColumnWidth(data, "trigger", 'Trigger'),
                style: {textAlign: "center"}
                //Cell: d => d.value >= 0.50 ? <div style={{width: '100%', height: '100%', backgroundColor: '#FF0000'}}> {d.value} </div> : <div> {d.value}</div>
              }
            ]}

              defaultSorted={[
                {
                  id: "jobName",
                  desc: false
                }
              ]}
              showPagination={true}
              defaultPageSize={this.state.length}
              // style={{
              //     height: "600px" // This will force the table body to overflow and scroll, since there is not enough room
              //   }}
              className="-striped -highlight"
              {...checkboxProps}
              SubComponent={row => {
                return (
                  <div>
                    <Subtable stationID={row.original.stationID} today={today}/>
                  </div>
                );
              }}
            />
        </div>
      );   
    }
  }



//   render() {

//     return (
//       <div>
//         <button onClick={logSelection}>Log Selection</button>
//         <CheckboxTable
//           ref={r => (this.checkboxTable = r)}
//           data={data}
//           columns={columns}
//           defaultPageSize={10}
//           className="-striped -highlight"
//           {...checkboxProps}
//         />
//       </div>
//     );
//   }
// }

// ShoppingList.propTypes = {
//     getData: PropTypes.func.isRequired,
//     data: PropTypes.object.isRequired
// }

// const mapStateToProps = (state) => ({
//     data: state.data
// });

// export default connect(mapStateToProps, { getData })(Table);

export default Table;