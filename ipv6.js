class IPv6 {
    constructor(s) {
        this.bytes = new Array(16).fill(0);  // 16 bytes
        if (s!==undefined) {
          this.from_string(s);
        }
    }

    from_string(s) {
        let blocks = s.split(':');
        // find the position of the :: block, if any
        let idx = blocks.findIndex(element => element == '');
        // extract bytes before the :: block
        for (var i = 0; i < idx; i++) {
            let block_n = parseInt(blocks[i], 16);  // 2 bytes
            this.bytes[2*i] = (block_n & 0xFF00) >> 8;
            this.bytes[2*i+1] = block_n & 0xFF;
        }
        // extract bytes after the :: block
        var tmp_bytes = new Array();
        for (var i = idx+1; i < blocks.length; i++) {
            let block_n = parseInt(blocks[i], 16);  // 2 bytes
            if (block_n != NaN) {
                tmp_bytes.push((block_n & 0xFF00) >> 8);
                tmp_bytes.push(block_n & 0xFF);
            }
        }
        // put the bytes after :: at the end
        this.set_bytes(tmp_bytes, 16 - tmp_bytes.length);
    }
    
    set_bytes(b, pos) {
        for (var i = 0; i < b.length; i++) {
            this.bytes[i+pos] = b[i]
        }
    }

    to_string() {
        let hex = [];  // blocks of 2 bytes
        for (var i = 0; i < 16; i+=2) {
          hex.push(((parseInt(this.bytes[i]) << 8) + parseInt(this.bytes[i+1])).toString(16));            
        }
        return hex.join(":");
    }
    
    to_decimal_string() {
        let decimal = [];  // 16 bytes as decimal numbers
        for (var i = 0; i < 16; i++) {
          decimal.push(this.bytes[i].toString())
        }
        return decimal.join(".");        
    }
};

class IPv4 {
  constructor(s) {
    this.bytes = new Array(4).fill(0);  // 4 bytes
    if (s!==undefined) {
        this.from_string(s);
    }
  }
  
  from_string(s) {
      let blocks = s.split('.');
      for (var i = 0; i < 4; i++) {
          this.bytes[i] = parseInt(blocks[i]);
      }
  }
  
};

// run some test cases
function test(ipv6, ipv4) {
    addr6 = new IPv6(ipv6);
    console.log(addr6.bytes);
    addr4 = new IPv4(ipv4);
    console.log(addr4.bytes);
    addr6.set_bytes(addr4.bytes, 12);
    console.log(addr6.to_string());
    console.log(addr6.to_decimal_string());
}

test('fe80::', '192.168.1.1');
test('fe80::5', '192.168.1.1');
test('::ffff', '255.255.0.0');
test('ffff:ffff::ffff:ffff', '0.0.0.0');
