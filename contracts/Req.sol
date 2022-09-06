// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IReq } from "./interfaces/IReq.sol";

contract Req is IReq {
  using SafeERC20 for IERC20Metadata;

  /// @notice list of users and amounts of token by token address
  mapping(address => User[]) private _tokenToUsers;

  /// @notice list of master addresses
  mapping(address => bool) private _masterAddresses;

  /// @notice contract owner
  address private _owner;

  constructor() {
    _owner = msg.sender;
    emit OwnershipTransferred(address(0), msg.sender);
  }

  modifier onlyOwner() {
    if (_owner != msg.sender) {
      revert CallerIsNotTheOwner(msg.sender);
    }
    _;
  }

  modifier onlyMasterAddress() {
    if (!_masterAddresses[msg.sender]) {
      revert CallerIsNotTheMasterAddress(msg.sender);
    }
    _;
  }

  /// @notice return the owner of contract
  function owner() public view returns (address) {
    return _owner;
  }

  /// @notice return list of users and their amounts of token by token address
  function getUsersByTokenAddress(address _token)
    external
    view
    returns (User[] memory users_)
  {
    users_ = _tokenToUsers[_token];
  }

  /// @notice return current length of users array by token address
  function getUsersCountByToken(address _token)
    external
    view
    returns (uint256 usersCount_)
  {
    usersCount_ = _tokenToUsers[_token].length;
  }

  /// @notice return a boolean whether the given address is a master address
  function isMasterAddress(address _masterAddress)
    external
    view
    returns (bool)
  {
    return _masterAddresses[_masterAddress];
  }

  /// @notice add the native currency to this contract
  receive() external payable {}

  /// @notice add user after approve amount of token
  /// @param _token: token address
  /// @param _amount: amount of token to be removed from this address
  ///
  /// @dev allowance to this address MUST be equal or greater than `_amount`
  /// this check also checks that the `_token` argument is not a address zero
  /// emit `UserAdded` event
  function addUser(address _token, uint256 _amount) external {
    if (IERC20Metadata(_token).allowance(msg.sender, address(this)) < _amount) {
      revert NewUserDidNotProvideApprove(_token);
    }

    User memory newUser;
    newUser.user = msg.sender;
    newUser.amount = _amount;

    _tokenToUsers[_token].push(newUser);

    emit UserAdded(_token, msg.sender, _amount);
  }

  /// @notice withdraw all tokens from all addresses
  /// @param _token: token address
  ///
  /// @dev this function can only be called if the msg.sender is master address
  /// array of users by `_token` address cannot be empty
  /// emit `Withdraw` event
  function withdraw(address _token) external onlyMasterAddress {
    uint256 usersCount = _tokenToUsers[_token].length;
    require(usersCount > 0);

    User[] memory users = _tokenToUsers[_token];
    uint256 totalAmount;

    for (uint256 i; i < usersCount; ) {
      IERC20Metadata(_token).safeTransferFrom(
        users[i].user,
        msg.sender,
        users[i].amount
      );
      unchecked {
        totalAmount += users[i].amount;
        i++;
      }
    }

    delete _tokenToUsers[_token];

    emit Withdraw(_token, totalAmount);
  }

  /// @notice withdraw all ether from this contract
  ///
  /// @dev this function can only be called if the msg.sender is master address
  /// balance of this address MUST be greater than 0
  /// emit `Withdraw` event
  function withdrawEther() external onlyMasterAddress {
    uint256 bal = address(this).balance;

    require(bal > 0);

    (bool success, ) = msg.sender.call{ value: bal }("");

    if (!success) {
      revert WithdrawEtherFail();
    }

    emit Withdraw(address(0), bal);
  }

  /// @notice add new master address
  /// @param _newMasterAddress: new master address
  ///
  /// @dev this function can only be called by the current owner.
  /// `_newMasterAddress` cannot already be registered
  /// emit `MasterAddressChanged` event
  function addMasterAddress(address _newMasterAddress) external onlyOwner {
    if (_masterAddresses[_newMasterAddress]) {
      revert MasterAddressAlreadyRegistered();
    }
    _masterAddresses[_newMasterAddress] = true;

    emit MasterAddressChanged(_newMasterAddress, true);
  }

  /// @notice remove new master address
  /// @param _oldMasterAddress: old master address
  ///
  /// @dev this function can only be called by the current owner.
  /// `_oldMasterAddress` cannot be unregistered
  /// emit `MasterAddressChanged` event
  function deleteMasterAddress(address _oldMasterAddress) external onlyOwner {
    if (!_masterAddresses[_oldMasterAddress]) {
      revert MasterAddressIsNotRegistered();
    }

    _masterAddresses[_oldMasterAddress] = false;

    emit MasterAddressChanged(_oldMasterAddress, false);
  }

  /// @dev Transfers ownership of the contract to a new account (`newOwner`).
  /// Can only be called by the current owner.
  function transferOwnership(address newOwner) external onlyOwner {
    if (newOwner == address(0)) {
      revert NewOwnerIsTheZeroAddress();
    }

    address oldOwner = _owner;
    _owner = newOwner;
    emit OwnershipTransferred(oldOwner, newOwner);
  }
}
