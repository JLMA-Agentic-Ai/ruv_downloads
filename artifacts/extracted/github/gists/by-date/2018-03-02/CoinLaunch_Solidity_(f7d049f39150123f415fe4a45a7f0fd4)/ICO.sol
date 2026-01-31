pragma solidity ^ 0.4.17;


library SafeMath {

    function mul(uint a, uint b) internal pure returns(uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function sub(uint a, uint b) internal pure  returns(uint) {
        assert(b <= a);
        return a - b;
    }

    function add(uint a, uint b) internal  pure returns(uint) {
        uint c = a + b;
        assert(c >= a && c >= b);
        return c;
    }
}


contract ERC20 {
    uint public totalSupply;

    function balanceOf(address who) public view returns(uint);

    function allowance(address owner, address spender) public view returns(uint);

    function transfer(address to, uint value) public returns(bool ok);

    function transferFrom(address from, address to, uint value) public returns(bool ok);

    function approve(address spender, uint value) public returns(bool ok);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {

    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    function Ownable() public {
        owner = msg.sender;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

}


/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
    modifier whenPaused() {
        require(paused);
        _;
    }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
    function pause() public onlyOwner whenNotPaused {
        paused = true;
        Pause();
    }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
    function unpause() public onlyOwner whenPaused {
        paused = false;
        Unpause();
    }
}


// Crowdsale Smart Contract
// This smart contract collects ETH and in return sends  tokens to the Backers
contract Crowdsale is Pausable {

    using SafeMath for uint;

    struct Backer {
        uint weiReceived; // amount of ETH contributed
        uint tokensSent; // amount of tokens  sent
        bool refunded;
    }

    Token public token; // Token contract reference   
    address public multisigETH; // Multisig contract that will receive the ETH
    address public commissionAddress;  // address to deposit commissions
    uint public tokensForTeam; // tokens for the team
    uint public ethReceivedPresale; // Number of ETH received in presale
    uint public ethReceivedMain; // Number of ETH received in main sale
    uint public totalTokensSent; // Number of tokens sent to ETH contributors
    uint public tokensSentMain;
    uint public tokensSentPresale;                
    uint public startBlock; // Crowdsale start block
    uint public endBlock; // Crowdsale end block
    uint public maxCap; // Maximum number of token to sell
    uint public minCap; // Minimum number of ETH to raise
    uint public minContributionMainSale; // Minimum amount to contribute in main sale
    uint public minContributionPresale; // Minimum amount to contribut in presale
    uint public maxContribution;
    bool public crowdsaleClosed; // Is crowdsale still on going
    uint public tokenPriceWei;
    uint public refundCount;
    uint public totalRefunded;
    uint public campaignDurationDays; // campaign duration in days 
    uint firstPeriod; 
    uint secondPeriod; 
    uint thirdPeriod; 
    uint firstBonus; 
    uint secondBonus;
    uint thirdBonus;
    uint public multiplier;
    uint public status;    
    Step public currentStep;  // To allow for controlled steps of the campaign 
   
    // Looping through Backer
    mapping(address => Backer) public backers; //backer list
    address[] public backersIndex;   // to be able to itarate through backers when distributing the tokens

    // @notice to set and determine steps of crowdsale
    enum Step {      
        FundingPreSale,     // presale mode
        FundingMainSale,  // public mode
        Refunding  // in case campaign failed during this step contributors will be able to receive refunds
    }

    // @notice to verify if action is not performed out of the campaing range
    modifier respectTimeFrame() {
        if ((block.number < startBlock) || (block.number > endBlock)) 
            revert();
        _;
    }

    modifier minCapNotReached() {
        if (totalTokensSent >= minCap) 
            revert();
        _;
    }

    // Events
    event ReceivedETH(address indexed backer, uint amount, uint tokenAmount);
    event Started(uint startBlockLog, uint endBlockLog);
    event Finalized(bool success);
    event ContractUpdated(bool done);
    event RefundETH(address indexed backer, uint amount);

    // Crowdsale  {constructor}
    // @notice fired when contract is crated. Initilizes all constnat variables.
    function Crowdsale(uint _decimalPoints,
                        address _multisigETH,
                        uint _toekensForTeam, 
                        uint _minContributionPresale,
                        uint _minContributionMainSale,
                        uint _maxContribution,                        
                        uint _maxCap, 
                        uint _minCap, 
                        uint _tokenPriceWei, 
                        uint _campaignDurationDays,
                        uint _firstPeriod, 
                        uint _secondPeriod, 
                        uint _thirdPeriod, 
                        uint _firstBonus, 
                        uint _secondBonus,
                        uint _thirdBonus) public {
    
        multiplier = 10**_decimalPoints;
        multisigETH = _multisigETH; 
        tokensForTeam = _toekensForTeam * multiplier;
        minContributionPresale = _minContributionPresale; 
        minContributionMainSale = _minContributionMainSale;
        maxContribution = _maxContribution;
        startBlock = 0; // ICO start block
        endBlock = 0; // ICO end block
        maxCap = _maxCap * multiplier;
        tokenPriceWei = _tokenPriceWei;
        minCap = _minCap * multiplier;
        campaignDurationDays = _campaignDurationDays;
        firstPeriod = _firstPeriod; 
        secondPeriod = _secondPeriod; 
        thirdPeriod = _thirdPeriod;
        firstBonus = _firstBonus;
        secondBonus = _secondBonus;
        thirdBonus = _thirdBonus; 
        totalTokensSent = 0;
        //TODO replace this address below with correct address.
        commissionAddress = 0x99aC790927f6890162339439e97078ee15771e1d;
        currentStep = Step.FundingPreSale;
    }

    // {fallback function}
    // @notice It will call internal function which handels allocation of Ether and calculates tokens.
    function () public payable {         
        contribute(msg.sender);
    }

    // @notice this function will determine status of crowdsale
    function determineStatus() external view returns (uint) {
       
        if (crowdsaleClosed)            // ICO finihsed
            return 1;   

        if (block.number < endBlock && totalTokensSent < maxCap - 100)   // ICO in progress
            return 2;            
    
        if (totalTokensSent < minCap && block.number > endBlock)      // ICO failed    
            return 3;            
    
        if (endBlock == 0)           // ICO hasn't been started yet 
            return 4;            
    
        return 0;         
    } 

    // @notice set the step of the campaign from presale to public sale
    // contract is deployed in presale mode
    // WARNING: there is no way to go back
    function advanceStep() external onlyOwner() {
        currentStep = Step.FundingMainSale;
    }

    // @notice It will be called by owner to start the sale    
    function start() external onlyOwner() {
        startBlock = block.number;
        endBlock = startBlock + (4*60*24*campaignDurationDays); // assumption is that one block takes 15 sec. 
        crowdsaleClosed = false;
        Started(startBlock, endBlock);
    }

    // @notice Specify address of token contract
    // @param _tokenAddress {address} address of token contract
    // @return res {bool}
    function updateTokenAddress(Token _tokenAddress) external onlyOwner() returns(bool res) {
        token = _tokenAddress;
        ContractUpdated(true);
        return true;    
    }

    // @notice This function will finalize the sale.
    // It will only execute if predetermined sale time passed or all tokens are sold.
    function finalize() external onlyOwner() {

        require(!crowdsaleClosed);                       
        require(block.number >= endBlock || totalTokensSent > maxCap - 1000);
                    // - 1000 is used to allow closing of the campaing when contribution is near 
                    // finished as exact amount of maxCap might be not feasible e.g. you can't easily buy few tokens. 
                    // when min contribution is 0.1 Eth.  

        require(totalTokensSent >= minCap);
        crowdsaleClosed = true;
        
        // transfer commission portion to the platform
        commissionAddress.transfer(determineCommissions());         
        
        // transfer remaning funds to the campaign wallet
        multisigETH.transfer(this.balance);
        
        if (!token.transfer(owner, token.balanceOf(this))) 
            revert(); // transfer tokens to admin account  

        token.unlock();    // release lock from transfering tokens. 
     
        if (!token.burn(this, token.balanceOf(this))) 
            revert();  // burn all the tokens remaining in the contract   

        Finalized(true);        
    }

    // @notice it will allow contributors to get refund in case campaign failed
    // @return {bool} true if successful
    function refund() external whenNotPaused returns (bool) {      
        
        uint totalEtherReceived = ethReceivedPresale + ethReceivedMain;

        require(totalEtherReceived < minCap);  // ensure that campaign failed
        require(this.balance > 0);  // contract will hold 0 ether at the end of campaign.
                                    // contract needs to be funded through fundContract() 
        Backer storage backer = backers[msg.sender];

        require(backer.weiReceived > 0);  // ensure that user has sent contribution
        require(!backer.refunded);        // ensure that user hasn't been refunded yet

        backer.refunded = true;  // save refund status to true
        refundCount++;
        totalRefunded += backer.weiReceived;

        if (!token.burn(msg.sender, backer.tokensSent)) // burn tokens
            revert();        
        msg.sender.transfer(backer.weiReceived);  // send back the contribution 
        RefundETH(msg.sender, backer.weiReceived);
        return true;
    }

       // TODO do we want this here?
    // @notice Failsafe drain
    function drain() public onlyOwner() {
        if (!owner.send(this.balance)) 
            revert();
    }

    // @notice to populate website with status of the sale 
    function returnWebsiteData() public view returns(uint, 
        uint, uint, uint, uint, uint, uint, uint, uint, uint, uint, bool, bool) {
    
        return (startBlock, endBlock, numberOfBackers(), ethReceivedPresale + ethReceivedMain, maxCap, minCap, 
                totalTokensSent, tokenPriceWei, minContributionPresale, minContributionMainSale, maxContribution, 
                paused, crowdsaleClosed);
    }

    function determineCommissions() public view returns (uint) {
     
        if (this.balance <= 500 ether) {
            return (this.balance * 10)/100;
        }else if (this.balance <= 1000 ether) {
            return (this.balance * 8)/100;
        }else if (this.balance < 10000 ether) {
            return (this.balance * 6)/100;
        }else {
            return (this.balance * 6)/100;
        }
    }

    // @notice return number of contributors
    // @return  {uint} number of contributors
    function numberOfBackers() public view returns (uint) {
        return backersIndex.length;
    }

    // @notice It will be called by fallback function whenever ether is sent to it
    // @param  _backer {address} address of beneficiary
    // @return res {bool} true if transaction was successful
    function contribute(address _backer) internal whenNotPaused respectTimeFrame returns(bool res) {
          
        uint tokensToSend = calculateNoOfTokensToSend(); // calculate number of tokens

        // Ensure that max cap hasn't been reached
        require(totalTokensSent + tokensToSend <= maxCap);
        
        Backer storage backer = backers[_backer];

        if (backer.weiReceived == 0)
            backersIndex.push(_backer);

        if (Step.FundingMainSale == currentStep) { // Update the total Ether received and tokens sent during public sale
            require(msg.value >= minContributionMainSale); // stop when required minimum is not met    
            ethReceivedMain = ethReceivedMain.add(msg.value);
            tokensSentMain += tokensToSend;
        }else {  
            require(msg.value >= minContributionPresale); // stop when required minimum is not met
            ethReceivedPresale = ethReceivedPresale.add(msg.value); 
            tokensSentPresale += tokensToSend;
        }  
       
        backer.tokensSent = backer.tokensSent + tokensToSend;
        backer.weiReceived = backer.weiReceived.add(msg.value);       
        totalTokensSent += tokensToSend;      

        if (!token.transfer(_backer, tokensToSend)) 
            revert(); // Transfer tokens to contributor

        ReceivedETH(_backer, msg.value, tokensToSend); // Register event
        return true;
    }

    // @notice This function will return number of tokens based on time intervals in the campaign
    function calculateNoOfTokensToSend() internal view returns (uint) {

        uint tokenAmount = msg.value.mul(multiplier) / tokenPriceWei;
        
        if (block.number <= startBlock + firstPeriod) {  
            return  tokenAmount + tokenAmount.mul(firstBonus) / 100;
        }else if (block.number <= startBlock + secondPeriod) {
            return  tokenAmount + tokenAmount.mul(secondBonus) / 100; 
        }else if (block.number <= startBlock + thirdPeriod) { 
            return  tokenAmount + tokenAmount.mul(thirdBonus) / 100;        
        }else {              
            return  tokenAmount; 
        }
    } 

 
 
}


// The  token
contract Token is ERC20, Ownable {

    using SafeMath for uint;
    // Public variables of the token
    string public name;
    string public symbol;
    uint public decimals; // How many decimals to show.
    string public version = "v0.1";
    uint public totalSupply;
    bool public locked;
    address public crowdSaleAddress;

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;
    
    // Lock transfer during the ICO
    modifier onlyUnlocked() {
        if (msg.sender != crowdSaleAddress && locked && msg.sender != owner) 
            revert();
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != crowdSaleAddress && msg.sender != owner) 
            revert();
        _;
    }

    // The Token constructor     
    function Token(uint _initialSupply,
            string _tokenName,
            uint _decimalUnits,
            string _tokenSymbol,
            string _version,
            address _crowdSaleAddress) public {      
        locked = true;  // Lock the transfer of tokens during the crowdsale
        totalSupply = _initialSupply * (10**_decimalUnits);     
                                        
        name = _tokenName; // Set the name for display purposes
        symbol = _tokenSymbol; // Set the symbol for display purposes
        decimals = _decimalUnits; // Amount of decimals for display purposes
        version = _version;
        crowdSaleAddress = _crowdSaleAddress;       
        balances[owner] = 100000 * (10**_decimalUnits);
        balances[crowdSaleAddress] = totalSupply - balances[owner];   
    }

    function resetCrowdSaleAddress(address _newCrowdSaleAddress) public onlyAuthorized() {
        crowdSaleAddress = _newCrowdSaleAddress;
    }

    function unlock() public onlyAuthorized {
        locked = false;
    }

    function lock() public onlyAuthorized {
        locked = true;
    }

    function burn(address _member, uint256 _value) public onlyAuthorized returns(bool) {
        require(balances[_member] >= _value);
        balances[_member] -= _value;
        totalSupply -= _value;
        Transfer(_member, 0x0, _value);
        return true;
    }

   
    // @notice transfer tokens to given address
    // @param _to {address} address or recipient
    // @param _value {uint} amount to transfer
    // @return  {bool} true if successful
    function transfer(address _to, uint _value) public onlyUnlocked returns(bool) {

        require(_to != address(0));
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
    }

    // @notice transfer tokens from given address to another address
    // @param _from {address} from whom tokens are transferred
    // @param _to {address} to whom tokens are transferred
    // @param _value {uint} amount of tokens to transfer
    // @return  {bool} true if successful
    function transferFrom(address _from, address _to, uint256 _value) public onlyUnlocked returns(bool success) {

        require(_to != address(0));
        require(balances[_from] >= _value); // Check if the sender has enough
        require(_value <= allowed[_from][msg.sender]); // Check if allowed is greater or equal
        balances[_from] -= _value; // Subtract from the sender
        balances[_to] += _value; // Add the same to the recipient
        allowed[_from][msg.sender] -= _value;  // adjust allowed
        Transfer(_from, _to, _value);
        return true;
    }

      // @notice to query balance of account
    // @return _owner {address} address of user to query balance
    function balanceOf(address _owner) public view returns(uint balance) {
        return balances[_owner];
    }

    /**
    * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
    *
    * Beware that changing an allowance with this method brings the risk that someone may use both the old
    * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
    * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
    * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    * @param _spender The address which will spend the funds.
    * @param _value The amount of tokens to be spent.
    */
    function approve(address _spender, uint _value) public returns(bool) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    // @notice to query of allowance of one user to the other
    // @param _owner {address} of the owner of the account
    // @param _spender {address} of the spender of the account
    // @return remaining {uint} amount of remaining allowance
    function allowance(address _owner, address _spender) public view returns(uint remaining) {
        return allowed[_owner][_spender];
    }

    /**
    * approve should be called when allowed[_spender] == 0. To increment
    * allowed value is better to use this function to avoid 2 calls (and wait until
    * the first transaction is mined)
    * From MonolithDAO Token.sol
    */
    function increaseApproval (address _spender, uint _addedValue) public returns (bool success) {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function decreaseApproval (address _spender, uint _subtractedValue) public returns (bool success) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

}