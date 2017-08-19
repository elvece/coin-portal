import React, { Component } from 'react';
import Client from '../Client';
import '../App.css';
import update from 'immutability-helper';
import ReactTable from 'react-table';
import 'react-table/react-table.css';


class ExchangeTable extends Component {
  constructor(props){
    super(props);
    this.state = ({ loading: true });
    this.handleUpdateExchange = this.handleUpdateExchange.bind(this);
  }
  componentDidMount(){
    const _this = this;
    //TODO: refactor this into own method
    this.serverRequest = Client.getStuff(`api/exchanges/`, function(result, reject){
      if(result){
        _this.setState({
          exchanges: result,
          loading: false
        });
      }
      if(reject) console.log('SERVER REJECTION: ', reject)
      })
  }
  handleUpdateExchange = (row) => {
    // console.log('UPDATE ROW: ', row)
    const ogRow = row.original;
    // persist this for use in callback function
    const _this = this;
    // temp data for simulating form update
    const data = {};
    Client.putStuff(`api/exchanges/`+ogRow._id, data, function(result){
      // use update to persist state immutability - update certain exchange coinData with result
      // console.log('result: ', result)
      const updatedExchange = update(ogRow, {
        accountNeeded: {$set: result.accountNeeded},
        coinData: {$set: result.coinData},
        coinsSupported: {$set: result.coinsSupported},
        depositFee: {$set: result.depositFee},
        purchaseOptions: {$set: result.purchaseOptions},
        service: {$set: result.service},
        social: {$set: result.social},
        support: {$set: result.support},
        trading: {$set: result.trading},
        verify: {$set: result.verify},
        website: {$set: result.website},
        withdrawalFee: {$set: result.withdrawalFee},
        ux: {$set: result.ux}
      });
      // replace certain exchange with updated exchange data
      const newExchanges = update(_this.state.exchanges, {$splice: [[row.index, 1, updatedExchange]]})
      // set state with updated exchanges, leaving original state record
      _this.setState({
        exchanges: newExchanges
      })
    });
  }

  render(){
    const { exchanges, loading } = this.state;

    function displayArrayAsList(data){
      let output = '';
      if(data){
        data.forEach((item, i) => {
          if(i !== data.length - 1){
            output += item + ', ';
          } else {
            output += item;
          }
        })
      }
      return output;
    }

    function getCoinPrice(data, name){
      let output = '--';
      data.coinData.forEach((coin) => {
        if(coin.name === name){
          output = coin.price;
        }
      })
      return output;
    }

    function getSocialInfo(data, name){
      let output = '--';
      if(data.social){
        data.social.forEach((acct) => {
          if(acct.name === name){
            output = acct;
          }
        })
      }
      return output;
    }

    function setFriendlyBoolean(data){
      let output = '';
      if(data === true){
        output = 'yes';
      } else if (data === false){
        output = 'no';
      }
      return output;
    }

    const columns =
    [
      {
        Header: 'Name',
        columns: [{
          Header: '<>',
          accessor: 'name',
          Cell: row => (<a target="_blank" href={row.original.website ? row.original.website : '/'}>{row.row.name}</a>)
        }]
      },
      {
        Header: 'Coin Prices',
        columns: [
          {
            Header: 'BTC',
            id: 'btc',
            accessor: data => getCoinPrice(data, 'BTC')
          },
          {
            Header: 'ETH',
            id: 'eth',
            accessor: data => getCoinPrice(data, 'ETH')
          },
          {
            Header: 'LTC',
            id: 'ltc',
            accessor: data => getCoinPrice(data, 'LTC')
          },
          {
            Header: 'DASH',
            id: 'dash',
            accessor: data => getCoinPrice(data, 'DASH')
          }
        ]
      },
      {
        Header: 'Fees',
        columns: [
          {
            Header: 'Withdrawl',
            accessor: 'withdrawalFee'
          },
          {
            Header: 'Deposit',
            accessor: 'depositFee'
          },
        ]
      },
      {
        Header: 'Account Needed',
        columns: [{
          Header: '<>',
          id: 'accountNeeded',
          accessor: data => setFriendlyBoolean(data.accountNeeded)
        }]
      },
      {
        Header: 'Purchase Options',
        columns: [{
          Header: '<>',
          id: 'purchaseOptions',
          accessor: data => data.purchaseOptions ? displayArrayAsList(data.purchaseOptions) : ''
        }]
      },
      {
        Header: 'Identity Verification', // make popover for coinbase that says depends on amount wanting to purchase
        columns: [{
          Header: '<>',
          id: 'verify',
          accessor: data => setFriendlyBoolean(data.verify)
        }]
      },
      {
        Header: 'Coins Supported',
        columns: [{
          Header: '<>',
          id: 'coinsSupported',
            accessor: data => data.coinsSupported ? displayArrayAsList(data.coinsSupported) : ''
        }]
      },
      {
        Header: 'Trading',
        columns: [
          {
            Header: 'Order Types',
            id: 'orderTypes',
            accessor: data => data.trading && data.trading.length > 0 ? displayArrayAsList(data.trading[0].orderTypes) : ''
          },
          {
            Header: 'Margin',
            id: 'margin',
            accessor: data => data.trading && data.trading.length > 0 && data.trading[0].margin ? data.trading[0].margin.toString() : ''
          },
          {
            Header: 'Auction',
            id: 'auction',
            accessor: data => data.trading && data.trading.length && data.trading[0].auction> 0 ? data.trading[0].auction.toString() : ''
          }
        ]
      },
      {
        Header: 'Social',
        columns: [
          {
            Header: 'Twitter',
            id: 'twitter',
            accessor: data => getSocialInfo(data, 'Twitter'),
            Cell: row => (<a href={row.row.twitter ? row.row.twitter.url : '/'}>Tweet</a>)
          },
          {
            Header: 'Reddit',
            id: 'reddit',
            accessor: data => getSocialInfo(data, 'Reddit'),
            Cell: row => (<a href={row.row.reddit ? row.row.reddit.url : '/'}>Arrr</a>)
          }
        ]
      },
      {
        Header: 'Ratings',
        columns: [
          {
            Header: 'Interface',
            accessor: 'ux',
          },
          {
            Header: 'Customer Service',
            accessor: 'service',
          },
          {
            Header: 'Support',
            accessor: 'support',
          }
        ],
      },
      {
        Header: 'Options',
        columns: [{
          Header: 'Edit',
          accessor: '_id',
          Cell: row => (<button onClick={() => this.handleUpdateExchange(row)}>Update</button>)
        }]
      }
    ];

    return (
      <ReactTable
        data={exchanges}
        columns={columns}
        defaultPageSize={5}
        loading={loading}
        defaultSorted={[
          {
            id: 'name',
            desc: true
          }
        ]}
        showPagination={false}
        showPageJump={false}
        sortabl={true}
        PadRowComponent ={() => <span>&nbsp;</span>}
        className={{}}
        style={{}}
        // column={[
        //   {
        //     resizeable: true,
        //     minWidth: 150,
        //     getHeaderProps: () => ({})
        //   },
        // ]}
      />
    );
  }
}

export default ExchangeTable;