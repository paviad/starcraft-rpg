﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Api.Controllers {
    [ApiController]
    [Route("[controller]/[action]")]
    [Authorize]
    public class SecuredController : ControllerBase {
        private readonly ILogger<SecuredController> _logger;
        private readonly UsersAdapter _usersAdapter;

        public SecuredController(ILogger<SecuredController> logger, UsersAdapter usersAdapter) {
            _logger = logger;
            _usersAdapter = usersAdapter;
        }

        public async Task<IActionResult> GetData(string key = "general", Guid? userId = null) {
            var currentUser = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            var admin = User.FindFirst("admin")?.Value;
            var guid = Guid.Parse(currentUser);
            var requestedGuid = userId ?? guid;
            if (admin != "True" && requestedGuid != guid) {
                return Unauthorized();
            }

            _logger.LogInformation($"Getting data for user id {requestedGuid}");
            var rc = await _usersAdapter.EnsureGetUserData(requestedGuid, key);
            return Content(rc.JsonData);
        }

        [HttpPost]
        public async Task<IActionResult> SetData([FromBody] SetDataModel model) {
            var currentUser = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            var admin = User.FindFirst("admin")?.Value;
            var guid = Guid.Parse(currentUser);
            var requestedGuid = model.UserId ?? guid;
            if (admin != "True" && requestedGuid != guid) {
                return Unauthorized();
            }
            await _usersAdapter.EnsureSetUserData(requestedGuid, model.Data, model.Key ?? "general");
            return NoContent();
        }

        [HttpGet]
        // [Authorize(Policy = "Admin")] // everyone's an admin for now
        public async Task<IEnumerable<User>> GetUsers() {
            var userIds = await _usersAdapter.GetUsers();
            return userIds;
        }
    }
}
