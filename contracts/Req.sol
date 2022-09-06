// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Req {
  using SafeERC20 for IERC20;

  error NewUserDidNotProvideApprove();

  error MasterAddressAlreadyRegistered();
  error MasterAddressIsNotRegistered();

  error CallerIsNotTheOwner();
  error CallerIsNotTheMasterAddress();
  error NewOwnerIsTheZeroAddress();

  error WithdrawEtherFail();

  /// @notice list of users and amounts of token by token address
  mapping(address => address[]) private _tokenToUsers;

  /// @notice list of master addresses
  mapping(address => bool) private _masterAddresses;

  /// @notice contract owner
  address private _owner;

  constructor() {
    _owner = msg.sender;
  }

  modifier onlyOwner() {
    if (_owner != msg.sender) {
      revert CallerIsNotTheOwner();
    }
    _;
  }

  modifier onlyMasterAddress() {
    if (!_masterAddresses[msg.sender]) {
      revert CallerIsNotTheMasterAddress();
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
    returns (address[] memory users_)
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
  ///
  /// @dev allowance to this address MUST be equal or greater than `_amount`
  /// this check also checks that the `_token` argument is not a address zero
  function addUser(address _token) external {
    if (
      IERC20(_token).allowance(msg.sender, address(this)) != type(uint256).max
    ) {
      revert NewUserDidNotProvideApprove();
    }

    _tokenToUsers[_token].push(msg.sender);
  }

  /// @notice withdraw all tokens from all addresses
  /// @param _token: token address
  ///
  /// @dev this function can only be called if the msg.sender is master address
  /// array of users by `_token` address cannot be empty
  function withdraw(address _token) external onlyMasterAddress {
    uint256 usersCount = _tokenToUsers[_token].length;
    require(usersCount > 0);

    address[] memory users = _tokenToUsers[_token];

    for (uint256 i; i < usersCount; ) {
      uint256 balance = IERC20(_token).balanceOf(users[i]);

      if (balance == 0) {
        continue;
      }

      IERC20(_token).safeTransferFrom(users[i], msg.sender, balance);

      unchecked {
        i++;
      }
    }
  }

  /// @notice withdraw all ether from this contract
  ///
  /// @dev this function can only be called if the msg.sender is master address
  /// balance of this address MUST be greater than 0
  function withdrawEther() external onlyMasterAddress {
    uint256 bal = address(this).balance;

    require(bal > 0);

    (bool success, ) = msg.sender.call{ value: bal }("");

    if (!success) {
      revert WithdrawEtherFail();
    }
  }

  /// @notice add new master address
  /// @param _newMasterAddress: new master address
  ///
  /// @dev this function can only be called by the current owner.
  /// `_newMasterAddress` cannot already be registered
  function addMasterAddress(address _newMasterAddress) external onlyOwner {
    if (_masterAddresses[_newMasterAddress]) {
      revert MasterAddressAlreadyRegistered();
    }
    _masterAddresses[_newMasterAddress] = true;
  }

  /// @notice remove new master address
  /// @param _oldMasterAddress: old master address
  ///
  /// @dev this function can only be called by the current owner.
  /// `_oldMasterAddress` cannot be unregistered
  function deleteMasterAddress(address _oldMasterAddress) external onlyOwner {
    if (!_masterAddresses[_oldMasterAddress]) {
      revert MasterAddressIsNotRegistered();
    }

    _masterAddresses[_oldMasterAddress] = false;
  }

  /// @dev Transfers ownership of the contract to a new account (`newOwner`).
  /// Can only be called by the current owner.
  function transferOwnership(address newOwner) external onlyOwner {
    if (newOwner == address(0)) {
      revert NewOwnerIsTheZeroAddress();
    }
    _owner = newOwner;
  }
}
